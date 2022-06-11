cp config.json backup-config.json
git checkout .
branch=$(git branch --show-current)
git pull origin $branch
npm install
mv backup-config.json config.json
