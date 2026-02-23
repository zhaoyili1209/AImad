# Nova Defense (天佑新星防御)

A classic Missile Command style tower defense game built with React, Vite, and Tailwind CSS.

## Features
- 9 Defensive Batteries with individual ammo management.
- 6 Cities to protect.
- Scaling difficulty.
- Bilingual support (English/Chinese).
- Responsive design for mobile and desktop.

## Deployment to Vercel

1. **Push to GitHub**:
   - Initialize a git repository: `git init`
   - Add files: `git add .`
   - Commit: `git commit -m "Initial commit"`
   - Create a repo on GitHub and push: 
     ```bash
     git remote add origin <your-github-repo-url>
     git branch -M main
     git push -u origin main
     ```

2. **Connect to Vercel**:
   - Go to [Vercel](https://vercel.com).
   - Click "Add New" -> "Project".
   - Import your GitHub repository.
   - Vercel will automatically detect the Vite framework.
   - **Environment Variables**: If you plan to use Gemini AI features, add `GEMINI_API_KEY` in the "Environment Variables" section of the Vercel project settings.
   - Click "Deploy".

## Local Development

```bash
npm install
npm run dev
```

## Build for Production

```bash
npm run build
```
The output will be in the `dist/` directory.
