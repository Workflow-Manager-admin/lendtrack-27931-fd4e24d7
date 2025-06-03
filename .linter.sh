#!/bin/bash
cd /home/kavia/workspace/code-generation/lendtrack-27931-fd4e24d7/lendtrack_main_container
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

