# employee-scheduling-project
This project helps employee to add/change the shift and employer can adjust the schedule if needed.

## Team Setup After Cloning

1. Clone and enter the project directory:
	 git clone <repo-url>
	 cd employee-scheduling-project

2. Install dependencies from the project root:
	 npm install

3. Create a local environment file:
	 cp .env.example .env

4. Start backend and frontend together:
	 npm run dev

5. Open services:
	 Frontend: http://localhost:3000
	 Backend: http://localhost:5050

## Notes

- Root install now runs a postinstall setup script that installs backend and frontend dependencies automatically.
- Backend uses nodemon in development and restarts automatically when backend files are saved.
- Frontend reloads automatically on save through react-scripts.
- If backend port 5050 is already in use, run with a different backend port:
	BACKEND_PORT=5001 npm run dev
- If frontend port 3000 is already in use, run with a different frontend port:
	PORT=3001 npm run dev
- If both ports are in use, override both:
	BACKEND_PORT=5001 PORT=3001 npm run dev
- If installation was interrupted, run this from root to reinstall subproject dependencies:
	npm run setup
