BASE_URL=https://u00n270neg.execute-api.us-east-1.amazonaws.com/dev

if [ -z "$BASE_URL" ]; then
  echo "BASE_URL is unset"
  exit
fi

# ---------------------------------------------------------------------

if [ $RUN = "YUP" ]; then
  if [ -z "$DATA" ]; then
    DATA="{message: 'YUP', test: '1', type: 'log'}"
  fi

  JSON=$(node -e "console.log(JSON.stringify($DATA))")

  curl "$BASE_URL/test/yup" -d "$JSON"
fi

# ---------------------------------------------------------------------

if [ $RUN = "YUPDYN" ]; then
  if [ -z "$DATA" ]; then
    DATA="{message: 'YUPDYN', test: '1', type: 'log'}"
  fi

  JSON=$(node -e "console.log(JSON.stringify($DATA))")

  curl "$BASE_URL/test/yup/dyn" -d "$JSON"
fi

# ---------------------------------------------------------------------

if [ $RUN = "STRUCT" ]; then
  if [ -z "$DATA" ]; then
    DATA="{message: 'STRUCT', type: 'log'}"
  fi

  JSON=$(node -e "console.log(JSON.stringify($DATA))")

  curl "$BASE_URL/test/struct" -d "$JSON"
fi

# ---------------------------------------------------------------------

if [ $RUN = "ROUTE" ]; then
  if [ -z "$DATA" ]; then
    DATA="{message: 'ROUTE', type: 'log'}"
  fi

  JSON=$(node -e "console.log(JSON.stringify($DATA))")

  curl "$BASE_URL/test?validator=yup" -d "$JSON"
fi

# ---------------------------------------------------------------------

if [ $RUN = "GET" ]; then
  curl "$BASE_URL/test"
fi

# ---------------------------------------------------------------------

if [ $RUN = "CACHE" ]; then
  curl "$BASE_URL/test/cache"
fi

