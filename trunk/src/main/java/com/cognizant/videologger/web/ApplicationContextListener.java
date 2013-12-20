package com.cognizant.videologger.web;

import java.io.File;
import java.lang.reflect.Type;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;

import com.cognizant.videologger.model.Video;
import com.cognizant.videologger.util.Utils;
import com.google.gson.Gson;

public class ApplicationContextListener implements ServletContextListener {

	public static Map<String, Video> VIDEO_LOG_PROJECTS = new HashMap<String, Video>();
	private static Map<String, Video> VIDEO_LOG_USER_PROJECT_NAMES = new HashMap<String, Video>();

	public void contextInitialized(ServletContextEvent context) {
		System.out.println("ApplicationContextListener...........");
		String existingData = Utils.readFromFile(new File("videolog.data"));
		Gson gsonLoad = new Gson();
		Type collectionType = new com.google.gson.reflect.TypeToken<List<Video>>() {
		}.getType();
		List<Video> savedProjects = gsonLoad.fromJson(existingData, collectionType);

		if (savedProjects != null) {
			for (Video videoLog : savedProjects) {
				VIDEO_LOG_PROJECTS.put(videoLog.getProjectId() + "" + videoLog.getUserId(), videoLog);
				VIDEO_LOG_USER_PROJECT_NAMES.put(videoLog.getProjectName() + "-" + videoLog.getUserId(), videoLog);
				System.out.println("[" + videoLog.getProjectName() + "-" + videoLog.getUserId() + "]");
			}
		}
	}

	public void contextDestroyed(ServletContextEvent context) {

	}

	public static boolean isUserHasProjectName(String name, int userId, String objectId) {
		boolean exists = false;
		Video video = VIDEO_LOG_USER_PROJECT_NAMES.get(name + "-" + userId);
		System.out.println("Validating:: " + "[" + name + "-" + userId + "]");
		if (video != null && !video.getProjectId().equals(objectId)) {
			exists = true;
		}
		return exists;
	}
}
