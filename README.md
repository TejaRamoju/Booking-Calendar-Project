A full-stack web application built using Angular 14 (Frontend) and Python Flask (Backend). Users can view available event slots, apply preferences, and book events.

Tech Stack

Frontend:

Angular 14

Angular Material

TypeScript

RxJS

Backend:

Python Flask

SQLite

Setup Instructions

1️⃣ Clone Repo
Run the following commands:
git clone https://github.com/TejaRamoju/Booking-Calendar-Project.git

cd Booking-Calendar-Project

2️⃣ Backend Setup
Navigate to the Backend folder and create a virtual environment:
cd Backend
python -m venv .venv

Activate the virtual environment:

Windows: source .venv/Scripts/activate

Mac/Linux: source .venv/bin/activate

Install dependencies:
pip install -r requirements.txt

Run the backend server:
python app.py

The backend runs at http://127.0.0.1:5000

3️⃣ Frontend Setup
Navigate to the Frontend folder:
cd Frontend

Install dependencies:
npm install

Run the frontend server:
ng serve

The frontend runs at http://localhost:4200
