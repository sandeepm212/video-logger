package com.cognizant.videologger.web;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.cognizant.videologger.model.ValidationInfo;
import com.cognizant.videologger.model.Video;

public class Validater extends HttpServlet {
	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		doPost(req, resp);
	}

	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		String filterType = req.getParameter("FILTER_TYPE");
		String filterValue = req.getParameter("FILTER_VALUE");
		ValidationInfo info = new ValidationInfo();
		if ("PROJECT_NAME".equals(filterType)) {
			Video video = ApplicationContextListener.VIDEO_LOG_PROJECTS.get(filterValue);
			if (video == null) {
				info.setValid(true);
			}
		}
	}
}
