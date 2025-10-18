# railway deployment setup

## deploy to railway

1. install railway cli:
```bash
npm i -g @railway/cli
```

2. login to railway:
```bash
railway login
```

3. create new project:
```bash
railway init
```

4. set environment variables:
```bash
railway variables set APIFY_TOKEN=apify_api_xxx
railway variables set SENSO_KEY=sk_prod_xxx
railway variables set FRONTEND_URL=https://your-frontend.vercel.app
```

5. deploy:
```bash
railway up
```

6. get your api url:
```bash
railway domain
```

## environment variables needed

- `APIFY_TOKEN` - your apify api token
- `SENSO_KEY` - your senso api key  
- `FRONTEND_URL` - your frontend url (optional, for cors)
- `PORT` - automatically set by railway

## update frontend

after deployment, update the frontend api url in `frontend/src/pages/tiktok-results.tsx`:

```typescript
const response = await fetch("https://your-api.railway.app/api/tiktok/search", {
```

## local testing

```bash
./start_api.sh
```

api will be available at http://localhost:8000
