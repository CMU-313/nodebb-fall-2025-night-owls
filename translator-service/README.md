# Translator Service

This repo contains a Python Flask web app that will perform live translations for input text. The repo contains starter code that provides hard-coded dummy translations, which you can modify to include calls to an LLM.

## Fork this repo to use

<img width="200" alt="image" src="https://github.com/CMU-313/translator-service/assets/5557706/47e9c1fb-5b9d-41fc-b825-05994867388a">

# Build and run locally

## Step 1: Open in DevContainer (Recommended)

This project includes a DevContainer configuration for a consistent development environment.

1. Make sure you have Docker installed and running
2. Open this repository in VS Code
3. When prompted, click "Reopen in Container" (or use Command Palette: "Dev Containers: Reopen in Container")
4. Wait for the container to build and start

## Step 2: Installing Dependencies

This project uses [UV](https://github.com/astral-sh/uv) for fast Python package management.

```bash
uv init                             # Creates virtual environment
uv add -r requirements.txt # Installs dependencies from requirements.txt
```

Note: UV will automatically create a virtual environment in `.venv` and install the dependencies. You don't need to manually activate the virtual environment if you use `uv run` for the commands below.

## Step 3: Run tests locally
```bash
uv run pytest                      # You should see the tests in test_translator.py run and pass successfully
```

## Step 4: Run the translator service locally

```bash
uv run flask run                   # Starts a web server on http://127.0.0.1:5000
```

Navigate to [http://127.0.0.1:5000/?content=Dies ist eine Nachricht auf Deutsch](http://127.0.0.1:5000/?content=Dies%20ist%20eine%20Nachricht%20auf%20Deutsch) and you should see the response JSON:

```
{"is_english":false,"translated_content":"This is a German message"}
```

See the code in `src/translator.py` for the full list of hard-coded dummy translations.

# Integrating the translator service with NodeBB

Now that you have a dummy translator service deployed, you can integrate it into NodeBB by allowing new posts to be translated at creation time and to display a "Translate" button for such posts. To save you the trouble, we are providing the code changes required for this UI. 
[https://github.com/CMU-313/NodeBB/pull/460](https://github.com/CMU-313/NodeBB/pull/460)

You can merge this commit directly if you know how to set up a new remote and perform cherry picking; or you can just look at the diffs above and copy+paste the changes carefully into your own NodeBB repos. These are provided only as suggestions but you are welcome to do something else.

## Testing the integration

Then redeploy NodeBB to your Linux VM using Docker. 

Now, when you create a new post using one of the hard-coded non-English texts they should get translated auotmatically by the back-end:

![image](https://github.com/user-attachments/assets/61f1d9ca-3ca4-4a68-8869-d381d3d06ac6)

After submitting...

![image](https://github.com/user-attachments/assets/f07d51ea-217a-44d8-a314-62bbe1a4cee4)

Clicking the button reveals...

![image](https://github.com/user-attachments/assets/1e804235-684f-46fd-b016-0d3dd3297991)


# Implementing the LLM based translator

Please replace `translate` method in `src/translator.py` with your LLM based
implementation. The `translate` method takes a string `content` as input and
returns a tuple `(bool, str)`, indicating if `content` is in English and
the translated content if `content` is not in English.  This should call out to your python service you developed.

## Handle responses from the LLM

You need to design your prompt so that you can parse the result from an LLM model.
However, your system needs to be robust enough to recover if the LLM does not respond as you expect.
It is up to you how your system reacts to unexpected responses. You can try a different prompt, return an error message, or simply assume the input is in English.

# Testing your implementation

Now you need to test your implementation.

To do this, please complete the unit test in `test/unit/test_translator.py`.
In `test_llm_normal_response()`, please implement a unit test that verifies that
your program can return correct value if LLM provides an expected result.
In `test_llm_gibberish_response()`, please implement a unit test that verifies
that your program can handle a gibberish response.
