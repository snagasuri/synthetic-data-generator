import React, { useState, useRef, useEffect } from 'react';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import Paragraph from '@editorjs/paragraph';
import './App.css';

const App = () => {
  const handleJumpToError = () => {
    if (errorLines.length > 0 && editorInstanceRef.current) {
      const firstErrorBlock = editorInstanceRef.current.blocks.getBlockByIndex(errorLines[0] - 1);
      if (firstErrorBlock) {
        editorInstanceRef.current.caret.setToBlock(firstErrorBlock.id, 'start');
        firstErrorBlock.holder.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };
  const [examples, setExamples] = useState('');
  const [instructions, setInstructions] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [editorContent, setEditorContent] = useState({});
  const [errorLines, setErrorLines] = useState([]);
  const editorRef = useRef(null);
  const editorInstanceRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'examples') {
      setExamples(value);
    } else if (name === 'instructions') {
      setInstructions(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setErrorLines([]);
    try {
      const payload = { examples, instructions };
      console.log('Request Payload:', payload);
      const response = await fetch('http://localhost:5000/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to generate data: ${errorText}`);
      }
      const data = await response.json();
      if (data.error) {
        setError(data.error);
      }
      setResult(data.data);
      if (editorInstanceRef.current) {
        editorInstanceRef.current.render({
          blocks: [
            {
              type: 'paragraph',
              data: {
                text: data.data || ''
              }
            }
          ]
        });
      }
    } catch (err) {
      console.error(err.message);
      setError("Generated JSON is not valid. Step through errors and fix manually, or regenerate.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (editorInstanceRef.current) {
      const outputData = await editorInstanceRef.current.save();
      const jsonData = JSON.stringify(outputData, null, 2);
      const element = document.createElement('a');
      const file = new Blob([jsonData], { type: 'application/json' });
      element.href = URL.createObjectURL(file);
      element.download = 'synthetic_data.json';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  const handleKeyDown = (e) => {
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      handleSave();
    }
  };

  const initializeEditor = () => {
    if (!editorInstanceRef.current) {
      editorInstanceRef.current = new EditorJS({
        holder: editorRef.current,
        tools: {
          header: Header,
          paragraph: Paragraph,
        },
        data: editorContent,
        onChange: async () => {
          const content = await editorInstanceRef.current.save();
          setEditorContent(content);
        },
      });
    }
  };

  useEffect(() => {
    initializeEditor();
    return () => {
      if (editorInstanceRef.current && typeof editorInstanceRef.current.destroy === 'function') {
        editorInstanceRef.current.destroy();
        editorInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const [errorLines, setErrorLines] = useState([]);

  return (
    <div className="app-container">
      <div className="main-content">
        <header className="header">
          <h1 className="header-title">Synthetic Chat Data Generator</h1>
        </header>
        <main className="content">
          <div className="settings">
            <form onSubmit={handleSubmit}>
              <fieldset className="settings-section">
                <legend className="settings-section-title">Examples</legend>
                <textarea
                  id="examples"
                  name="examples"
                  value={examples}
                  onChange={handleInputChange}
                  rows="6"
                  className="input"
                  placeholder="Enter examples of your data here."
                  required
                ></textarea>
              </fieldset>
              <fieldset className="settings-section">
                <legend className="settings-section-title">Instructions</legend>
                <textarea
                  id="instructions"
                  name="instructions"
                  value={instructions}
                  onChange={handleInputChange}
                  rows="4"
                  className="input"
                  placeholder="number of examples, start and stop tokens, etc"
                ></textarea>
              </fieldset>
              <button type="submit" className="button" disabled={isLoading}>
                {isLoading ? 'Generating...' : 'Generate Data'}
              </button>
            </form>
          </div>
          <div className="output-section">
            <div className="output-header">
              <span className="output-title">Output</span>
              <div className="button-group">
                <button className="save-button" onClick={handleSave}>
                  Save
                </button>
                <button className="jump-to-error-button" onClick={handleJumpToError}>
                  Jump to Error
                </button>
                <button className="download-button" onClick={handleSave}>
                  Download JSON
                </button>
              </div>
            </div>
            {error && (
              <div className="error-message">
                <strong>Error:</strong> {error}
              </div>
            )}
            <div ref={editorRef} className="editor-container"></div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
