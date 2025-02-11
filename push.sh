#!/usr/bin/env bash

while :
do
  VAR=`date "+%Y-%m-%d_%H-%M"`
  read -p "commit message [$VAR]? " MES
  if [ -z $MES ]; then
    MES=$VAR
  fi
  echo "your commit message: $MES"
  read -p "ok? (Y/n/q): " CHECK_YN
  if [ -z $CHECK_YN ]; then
    CHECK_YN='Y'
  fi
  case "$CHECK_YN" in
    [yY])
      echo "Adding new files..."
      git add .
      echo "Committing local repository..."
      git commit . -m "$MES"
      echo "Done."
      read -p "push to remote? (Y/n):" CHECK_PUSH
      if [ -z $CHECK_PUSH ]; then
        CHECK_PUSH='Y'
      fi 
      case "$CHECK_PUSH" in
        [yY])
          echo "Pushing to remote..."
          git push
          echo "Done."
        ;;
        [nN])
          echo "Local commit only."
        ;;
      esac
      break
    ;;
    [nN])
      echo "Start over"
    ;;
    [qQ])
      echo "Abort"
      break
    ;;
  esac
done

# read -n 1 -p "Hit any key: " str  

exit 0
