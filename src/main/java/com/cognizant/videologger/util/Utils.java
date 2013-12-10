package com.cognizant.videologger.util;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;

public class Utils {
	public static void writeToFile(String content, File outfile) {
		try {
			// File file = new File("videolog.data");

			// if file doesnt exists, then create it
			if (!outfile.exists()) {
				outfile.createNewFile();
			}
			FileWriter fw = new FileWriter(outfile.getAbsoluteFile());
			BufferedWriter bw = new BufferedWriter(fw);
			bw.write(content);
			bw.close();

			System.out.println("Done");

		} catch (IOException e) {
			e.printStackTrace();
		}
	}

	public static String readFromFile(File infile) {
		BufferedReader br = null;
		StringBuilder outdata = new StringBuilder();
		try {
			String sCurrentLine;
			br = new BufferedReader(new FileReader(infile));
			while ((sCurrentLine = br.readLine()) != null) {
				outdata.append(sCurrentLine);
			}
		} catch (IOException e) {
			e.printStackTrace();
		} finally {
			try {
				if (br != null)
					br.close();
			} catch (IOException ex) {
				ex.printStackTrace();
			}
		}
		return outdata.toString();
	}
}
