package com.cognizant.videologger.web;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.lang.reflect.Type;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.cognizant.videologger.model.Video;
import com.cognizant.videologger.util.Utils;
import com.google.gson.Gson;

public class SaveVideoLog extends HttpServlet {
	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		doPost(req, resp);
	}

	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {

		StringBuilder jsonBody = new StringBuilder();
		BufferedReader bufferedReader = null;
		try {
			InputStream inputStream = req.getInputStream();
			if (inputStream != null) {
				bufferedReader = new BufferedReader(new InputStreamReader(inputStream));
				char[] charBuffer = new char[128];
				int bytesRead = -1;
				while ((bytesRead = bufferedReader.read(charBuffer)) > 0) {
					jsonBody.append(charBuffer, 0, bytesRead);
				}
			} else {
				jsonBody.append("");
			}
		} catch (IOException ex) {
			throw ex;
		} finally {
			if (bufferedReader != null) {
				try {
					bufferedReader.close();
				} catch (IOException ex) {
					throw ex;
				}
			}
		}
		System.out.println("jsonBody:: " + jsonBody);
		Gson gson = new Gson();
		Type collectionType = new com.google.gson.reflect.TypeToken<List<Video>>() {
		}.getType();
		List<Video> logs = gson.fromJson(jsonBody.toString(), collectionType);
		for (Video videoLog : logs) {
			ApplicationContextListener.VIDEO_LOG_PROJECTS.put(videoLog.getProjectId() + "" + videoLog.getUserId(), videoLog);
		}
		String gsonData = gson.toJson(ApplicationContextListener.VIDEO_LOG_PROJECTS.values());
		System.out.println("-------" + gson.toJson(logs));

		Utils.writeToFile(gsonData, new File("videolog.data"));
	}
}
