package com.cognizant.videologger.model;

public class Action {
	private String name;
	private String shortCutKey;
	private String description;
	private Style style;

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getShortCutKey() {
		return shortCutKey;
	}

	public void setShortCutKey(String shortCutKey) {
		this.shortCutKey = shortCutKey;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public Style getStyle() {
		return style;
	}

	public void setStyle(Style style) {
		this.style = style;
	}

}
