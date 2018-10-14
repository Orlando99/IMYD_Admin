
# This script is meant to be called from a Jenkins Execute Shell build step
ENV="-dev"
if [ "$DEPLOY_ENV" = "DEVELOP" ]; then
  ENV="-dev"
elif [ "$DEPLOY_ENV" = "QA" ]; then
  ENV="-qa"
elif [ "$DEPLOY_ENV" = "PRODUCTION" ]; then
  ENV=""
fi

WEBROOT="/var/www/admin$ENV.imyourdoc.com"
echo "Installing Node project at $WEBROOT"

rsync --delete -r "$WORKSPACE/build/." $WEBROOT
