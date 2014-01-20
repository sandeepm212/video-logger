package com.cognizant.videologger.web;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.cognizant.videologger.util.Utils;

public class GetVideoLog extends HttpServlet {

	private static final long serialVersionUID = 2387206841559992696L;

	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		doPost(req, resp);
	}

	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		if ("true".equals(req.getParameter("publish"))) {
			downloadLogs(req, resp);
		} else {
			String data = Utils.readFromFile(new File("videolog.data"));
			System.out.println("Data saved:: " + data);
			resp.setContentType("text/json");
			PrintWriter out = resp.getWriter();
			out.println(data);
		}

	}

	protected void downloadLogs(HttpServletRequest req, HttpServletResponse resp) throws IOException {
		String pid = req.getParameter("pid");
		if ("y".equals(req.getParameter("show"))) {
			resp.setContentType("application/json");
			resp.setHeader("Content-Disposition", "attachment; filename=VideoLogs.json");
			String data = (String)req.getSession().getAttribute(pid);
			resp.getOutputStream().print(data);
			req.getSession().removeAttribute(pid);
		} else {
			String jsonData = getJsonBody(req);
			req.getSession().setAttribute(pid, jsonData);
		}
		
	}

	public String getJsonBody(HttpServletRequest req) throws IOException {
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
		return jsonBody.toString();
	}
}
