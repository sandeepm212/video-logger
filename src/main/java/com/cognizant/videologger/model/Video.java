package com.cognizant.videologger.model;

import java.util.List;

public class Video {
	private int id;
	private List<VideoLog> videoLogs;

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public List<VideoLog> getVideoLogs() {
		return videoLogs;
	}

	public void setVideoLogs(List<VideoLog> videoLogs) {
		this.videoLogs = videoLogs;
	}

}
