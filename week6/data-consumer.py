import argparse
import logging

from kafka import KafkaConsumer

logger_format = "%(asctime)s - %(message)s"
logging.basicConfig(format=logger_format)
logger  = logging.getLogger('data-consumer')
logger.setLevel(logging.DEBUG)


def consume(topic_name, kafka_broker):
	"""
	Helper method to consume data from kafka
	"""
	logger.debug('Consume topic of %s from kafka: %s', topic_name, kafka_broker)
	consumer = KafkaConsumer(topic_name, bootstrap_servers=kafka_broker)
	logger.debug('Get the data from kafka.')

	for message in consumer:
		print(message)

	logger.debug('Finished work.')


if __name__ == '__main__':
	parser = argparse.ArgumentParser()
	parser.add_argument('topic_name', help='the kafka topic pull from')
	parser.add_argument('kafka_broker', help='the location of kafka broker')

	# Parse argument
	args = parser.parse_args()
	topic_name = args.topic_name
	kafka_broker = args.kafka_broker

	# Consume the data from kafka
	consume(topic_name, kafka_broker)
