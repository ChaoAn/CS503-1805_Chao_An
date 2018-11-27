package com.bittiger.dbserver;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.concurrent.ThreadLocalRandom;

public final class RandomLoadBalancer extends LoadBalancer {

	private static transient final Logger LOG = LoggerFactory.getLogger(RandomLoadBalancer.class);

	private int nextReadServer = 0;
	
	@Override
	public Server getNextWriteServer() {
		nextReadServer = ThreadLocalRandom.current().nextInt(0, readQueue.size());
		Server server = readQueue.get(nextReadServer);
		LOG.debug("choose read server as " + server.getIp());
		return server;
	}

	@Override
	public Server getNextReadServer() {
		LOG.debug("choose write server as " + writeQueue.getIp());
		return writeQueue;
	}

}
