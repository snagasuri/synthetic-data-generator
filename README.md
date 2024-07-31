# synthetic data generator
generate synthetic data for finetuning language models

# to install:
- ```pip install requirements.txt``` in backend folder
- ```npm install``` in root

# to run:
- in root, run ```npm start``` in terminal
- in backend, run ```python server.py``` in terminal

# demo
  <img width="1510" alt="image" src="https://github.com/user-attachments/assets/5611941c-64f3-4605-88cb-3fee9a8c1f87">

# example json
```json
{
    "glossary": {
        "title": "example glossary",
		"GlossDiv": {
            "title": "S",
			"GlossList": {
                "GlossEntry": {
                    "ID": "SGML",
					"SortAs": "SGML",
					"GlossTerm": "Standard Generalized Markup Language",
					"Acronym": "SGML",
					"Abbrev": "ISO 8879:1986",
					"GlossDef": {
                        "para": "A meta-markup language, used to create markup languages such as DocBook.",
						"GlossSeeAlso": ["GML", "XML"]
                    },
					"GlossSee": "markup"
                }
            }
        }
    }
}
```
