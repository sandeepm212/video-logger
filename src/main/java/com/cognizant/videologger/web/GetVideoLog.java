package com.cognizant.videologger.web;

import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.cognizant.videologger.util.Utils;

public class GetVideoLog extends HttpServlet {
	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		doPost(req, resp);
	}

	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		String data = Utils.readFromFile(new File("videolog.data"));
		System.out.println("Data saved:: " + data);
		resp.setContentType("text/json");
		PrintWriter out = resp.getWriter();
		
		out.println(data);

	}
}
