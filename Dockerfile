FROM cypress/base:14.17.0

WORKDIR /app

RUN apt update
RUN apt install graphicsmagick imagemagick ghostscript -y

COPY . .

RUN rm -rf node_modules
RUN npm install
RUN DEBUG=cypress:cli npx cypress version

RUN resource_app_path=$(DEBUG=cypress:cli npx cypress version 2>&1 | grep package.json | sed -n 's/.*from: \(.*\)\/package.json/\1/p') && \
    appyml=$(find . $resource_app_path | grep config\/app\.yml | head -n1) && \
    sed -i "s/\"https:\/\/api.cypress.io\/\"/\"http:\/\/director:1234\/\"/" $appyml && \
    sed -i "s/\"https:\/\/on.cypress.io\/\"/\"http:\/\/director:8080\/\"/" $appyml && \
    echo "" && \
    cat $appyml && \
    echo ""

CMD ["npx", "cypress", "run", "--config-file", "cypress.json"]