FROM node:16
# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install &&\
    apt-get clean && apt-get update && \
    # apt-get install texlive-full &&\
    # apt-get -y install --no-install-recommends pandoc texlive-latex-extra texlive-generic-extra texlive-extra-utils texlive-fonts-extra texlive-bibtex-extra biber latexmk make git procps locales curl && \
    apt-get -y install --no-install-recommends pandoc texlive-full texlive-latex-extra texlive-luatex luatex texlive-generic-extra texlive-extra-utils texlive-fonts-extra texlive-bibtex-extra biber latexmk make git procps locales curl && \
    rm -rf /var/lib/apt/lists/*
    # apt-get install -y --no-install-recommends texlive-fonts-recommended && \
    # apt-get install -y --no-install-recommends texlive-latex-recommended texlive-fonts-recommended && \
    # apt-get install -y --no-install-recommends texlive-latex-extra texlive-fonts-extra texlive-lang-all && \
    # apt-get install -y \
    # biber \
    # cm-super \
    # fontconfig \
    # git-core \
    # preview-latex-style \
    # python3 \
    # texlive-bibtex-extra \
    # texlive-fonts-extra \
    # texlive-generic-extra \
    # texlive-lang-all \
    # texlive-latex-base \
    # texlive-latex-extra \
    # texlive-math-extra \
    # texlive-publishers \
    # texlive-science \
    # texlive-xetex\
    # rm -rf /var/lib/apt/lists/*
# generating locales
RUN sed -i -e 's/# en_US.UTF-8 UTF-8/en_US.UTF-8 UTF-8/' /etc/locale.gen && \
    dpkg-reconfigure --frontend=noninteractive locales && \
    update-locale LANG=en_US.UTF-8
ENV LANGUAGE=en_US.UTF-8 LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8

# installing cpanm & missing latexindent dependencies
RUN curl -L http://cpanmin.us | perl - --self-upgrade && \
    cpanm Log::Dispatch::File YAML::Tiny File::HomeDir    
# If you are building your code for production
# RUN npm ci --only=production
# Bundle app source
COPY . .

EXPOSE 8080

CMD [ "node", "server.js","bash" ]