package com.cognizant.videologger.model;

import java.util.List;

public class Video {
	private String projectName;
	private int id;
	private int userId;
	private String url;
	private String thumbnailUrl;
	private String videoType;
	private List<VideoLog> videoLogs;
	private List<Action> actions;

	public int getUserId() {
		return userId;
	}

	public void setUserId(int userId) {
		this.userId = userId;
	}

	public String getProjectName() {
		return projectName;
	}

	public String getThumbnailUrl() {
		return thumbnailUrl;
	}

	public void setThumbnailUrl(String thumbnailUrl) {
		this.thumbnailUrl = thumbnailUrl;
	}

	public void setProjectName(String projectName) {
		this.projectName = projectName;
	}

	public List<Action> getActions() {
		return actions;
	}

	public void setActions(List<Action> actions) {
		this.actions = actions;
	}

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

	public String getUrl() {
		return url;
	}

	public void setUrl(String url) {
		this.url = url;
	}

	public String getVideoType() {
		return videoType;
	}

	public void setVideoType(String videoType) {
		this.videoType = videoType;
	}

}
