FROM postgis/postgis:13-3.1-alpine
LABEL maintainer="hello@vizzuality.com"

CMD ["postgres", "-c", "max_stack_depth=7MB"]
