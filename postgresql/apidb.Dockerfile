FROM postgres:14.6-alpine3.16
LABEL maintainer="hello@vizzuality.com"

CMD ["postgres", "-c", "max_stack_depth=7MB"]
