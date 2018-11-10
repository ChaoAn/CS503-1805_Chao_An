FROM ubuntu:latest

MAINTAINER Chao An

RUN apt-get update
RUN apt-get install -y python python-pip wget
COPY ./data-producer.py /
COPY ./data-consumer.py /
COPY ./requirements.txt /
RUN pip install -r requirements.txt

CMD python data-producer.py BTC-USD test kafka:9092