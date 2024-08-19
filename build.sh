#!/bin/bash
npm run build;
cd dist;
rm -rf ./.vite;
cd ..;
zip -r reading-assistant.zip dist/;
