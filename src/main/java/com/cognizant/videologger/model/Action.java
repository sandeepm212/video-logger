package com.cognizant.videologger.model;

public class Action {
	private String name;
	private String hotKeyChar;
	private String hotKeyCode;
	private String description;	
	private Style style;

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getHotKeyChar() {
		return hotKeyChar;
	}

	public void setHotKeyChar(String hotKeyChar) {
		this.hotKeyChar = hotKeyChar;
	}

	public String getHotKeyCode() {
		return hotKeyCode;
	}

	public void setHotKeyCode(String hotKeyCode) {
		this.hotKeyCode = hotKeyCode;
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
