FROM postgis/postgis:14-3.3-alpine
LABEL maintainer="hello@vizzuality.com"

CMD ["postgres", "-c", "max_stack_depth=7MB"]
