# Payments Project — Python helper

This workspace primarily contains a Node.js backend and a static frontend. This small Python helper shows how to create a virtual environment and run a minimal Flask example.

Quick setup (Windows PowerShell):

1. Create the virtual environment:

```powershell
py -3 -m venv venv
```

2. Install packages into the venv:

```powershell
.\venv\Scripts\python -m pip install --upgrade pip setuptools wheel
.\venv\Scripts\python -m pip install -r requirements.txt
```

3. Run the example Flask app:

```powershell
.\venv\Scripts\python app_flask.py
# then open http://localhost:5000/health
```

Notes:
- To run the main payments app use the Node/Docker instructions already in the repo.
- If you prefer, I can install the packages into the venv for you now and verify they're present.
