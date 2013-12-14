package com.cognizant.videologger.model;

public class VideoLog {
	private String action;
	private String note;
	private String startTime;
	private String endTime;
	private String relativeX;
	private String relativeY;
	private String eventType;

	public String getAction() {
		return action;
	}

	public void setAction(String action) {
		this.action = action;
	}

	public String getNote() {
		return note;
	}

	public void setNote(String note) {
		this.note = note;
	}

	public String getStartTime() {
		return startTime;
	}

	public void setStartTime(String startTime) {
		this.startTime = startTime;
	}

	public String getEndTime() {
		return endTime;
	}

	public void setEndTime(String endTime) {
		this.endTime = endTime;
	}

	public String getRelativeX() {
		return relativeX;
	}

	public void setRelativeX(String relativeX) {
		this.relativeX = relativeX;
	}

	public String getRelativeY() {
		return relativeY;
	}

	public void setRelativeY(String relativeY) {
		this.relativeY = relativeY;
	}

}
