import React, { useState, useRef, useEffect } from 'react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/themes/prism.css';
import 'prismjs/components/prism-json';
import './App.css';

const App = () => {
  const [examples, setExamples] = useState('');
  const [instructions, setInstructions] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [editorContent, setEditorContent] = useState('');
  const editorRef = useRef(null);

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
      const parsedData = JSON.parse(data.data);
      setResult(parsedData);
      setEditorContent(JSON.stringify(parsedData, null, 2));
    } catch (err) {
      console.error(err.message);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    const jsonData = editorContent;
    const element = document.createElement('a');
    const file = new Blob([jsonData], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'synthetic_data.json';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleKeyDown = (e) => {
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      handleSave();
    }
  };

  useEffect(() => {
    const editor = editorRef.current;
    editor.addEventListener('keydown', handleKeyDown);
    return () => {
      editor.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

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
              <button className="save-button" onClick={handleSave}>
                Save
              </button>
              <button className="download-button" onClick={handleSave}>
                Download JSON
              </button>
            </div>
            <div ref={editorRef} className="editor-container">
              <Editor
                value={editorContent}
                onValueChange={(code) => setEditorContent(code)}
                highlight={(code) => Prism.highlight(code, Prism.languages.json, 'json')}
                padding={10}
                className="code-editor"
              />
            </div>
          </div>
        </main>
      </div>
      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      )}
    </div>
  );
};

export default App;
