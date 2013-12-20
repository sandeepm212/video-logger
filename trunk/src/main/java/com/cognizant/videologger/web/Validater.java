package com.cognizant.videologger.web;

import java.io.IOException;
import java.io.PrintWriter;
import java.lang.reflect.Type;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.cognizant.videologger.model.ValidationInfo;
import com.cognizant.videologger.model.Video;
import com.google.gson.Gson;

public class Validater extends HttpServlet {
	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		doPost(req, resp);
	}

	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		String filterType = req.getParameter("FILTER_TYPE");
		String filterValue = req.getParameter("FILTER_VALUE");
		String userId = req.getParameter("USER_ID");
		String objectId = req.getParameter("OBJECT_ID");
		ValidationInfo info = new ValidationInfo();
		System.out.println(filterType + " --- " + filterValue);
		if ("PROJECT_NAME".equals(filterType)) {
			boolean exists = ApplicationContextListener.isUserHasProjectName(filterValue, 0, objectId);
			info.setValid(!exists);
		}
				
		Gson gson = new Gson();		
		String validationObj = gson.toJson(info);
		
		resp.setContentType("text/json");
		PrintWriter out = resp.getWriter();
		
		out.println(validationObj);
	}
}
