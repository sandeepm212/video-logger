package com.cognizant.videologger.web;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.lang.reflect.Type;
import java.util.Date;
import java.util.List;

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
		
		Gson gson = new Gson();		
		String newProjId = null;
		Video videoLog = gson.fromJson(jsonBody.toString(), Video.class);
		if (videoLog != null) {
			if (videoLog.getProjectId() == null || videoLog.getProjectId().trim().length() == 0) {
				newProjId = System.currentTimeMillis() + "" + videoLog.getUserId();
				videoLog.setProjectId(newProjId);
			}
			videoLog.setLastSavedDate(new Date().getTime()+"");
			ApplicationContextListener.VIDEO_LOG_PROJECTS.put(videoLog.getProjectId() + "" + videoLog.getUserId(), videoLog);
		}
		
		String gsonData = gson.toJson(ApplicationContextListener.VIDEO_LOG_PROJECTS.values());
		Utils.writeToFile(gsonData, new File("videolog.data"));
		
		resp.setContentType("text/json");
		PrintWriter out = resp.getWriter();
		String response = "{\"projectId\":\"" + newProjId + "\"}";
		System.out.println("response::[" + response + "]");
		out.println(response);
	}
}
