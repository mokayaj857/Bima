import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || 'AIzaSyAl9v6j-dpnpTR4JXly1uxx4AQglFA_6H4');

const systemInstruction = `You are an AI assistant for the project **Bima**.
Your role is to answer questions based on the following research report on Bima here is what Bima is about :

[Water, this most valuable of resources, is acutely short across Africa, with millions lacking access to safe drinking water and relying on inefficient systems. Outdated supply infrastructures result in excessive wastage, leakages, and theft. The project exploits the IoT technology, deploying smart meters and sensor networks to facilitate real-time monitoring, automated detection, and reporting of both water theft and leak events. USSD mobile technology is used to enable fast field reporting to enable community members and technicians to report problems directly and in real-time. Concurrently, an interactive dashboard shows IoT sensor data readings and system alerts for far-off vision and decision-making. The outcome is an efficient, holistic water management mode minimizing losses, maximizing transparency of operations, and maximizing effective responses thus improving water security and sustainability to society.
Introduction
1.1 Background
Water, the most vital of resources, is running perilously low throughout Africa. Chronic drought, irregular rainfall, and rapidly expanding population reinforce the strain on dwindling water resources. Obsolete water supply and drainage pipes result in gigantic wastage and theft, speeding the process. Debris and chemicals emitted by industrial and agricultural production deplete further the supply of clean water. The African water crisis is also worsened by poor water management facilities and infrastructure, including poor maintenance and technologically inferior techniques, leading to early failure of infrastructure. The Internet of Things (IoT), an emerging technology, offers sustainable solutions to water infrastructure challenges, particularly leak detection and preventing water theft.
1.2 Problem Statement
Millions do not have basic drinking water infrastructure and guaranteed access due to water theft, leakage, aged supply infrastructure, and absence of proper monitoring and management.
1.3 Research Question
How can smart water management solutions utilizing IoT sensors, USSD reporting, and dashboard visualization identify, report and prevent cases of water theft and leakage for improved water system performance?
1.4 Objectives
1.4.1 General Objective
To implement an integrated water monitoring system Through IoT technologies, mobile-based USSD case reporting, and a visualization dashboard to track, report, and reduce theft and leakage.
1.4.2 Specific Objectives
(i) To implement  IoT-enabled sensors that monitor real-time data on water quality, flow, loss, and anomalies.
(ii) To enable direct incident reporting via USSD for field and community participation.
(iii) To develop a dashboard platform for remote real-time visualization of all readings, alerts, and historic performance metrics.
1.5 Scope of the Research
The study covers deployment strategies for IoT-based water monitoring in urban and rural African contexts, with  comprehensive sensor networks, USSD-enabled incident reporting, and dashboard integration for alert visualization and management across stakeholders.

Chapter 2 Literature Review
Water management systems in Africa have traditionally faced severe infrastructural and resource challenges, leading to significant water losses from both theft and leakage. Recent technological innovations, spearheaded by IoT, have enabled smart water meters and advanced sensor networks that log water usage and offer insights and analytics to optimize consumption patterns. Leak detection systems are critical, as millions of liters of water are lost due to undetected pipeline leaks. IoT sensors can be used to pinpoint leaks in real-time, facilitating rapid rectification and saving invaluable water resources. Smart water management collaborations such as Safaricom-Kenya Water Institute showcase holistic approaches through the integration of smart water meters, real-time monitoring, and dashboard visualization. USSD mobile reporting integrates field and community feedback in real time and improves responsiveness of utilities and governments.

Chapter 3  Methodology
IoT-based  water management is put to action  through the planning, allocation, and monitoring of water resources using interconnected sensors, controllers, and analytic platforms. The smart water management system consists of sensors (pH, flow, temperature, leak detection, etc.) affixed to water lines and facilities, all connected to microcontrollers or single-board computers such as Raspberry Pi. Sensor data (flow rates, pressure, water quality) is transmitted to cloud servers for real-time graphical analysis and automated intervention.
Installation of smart water meters and leak sensors at household and infrastructure levels
Utilization of microcontrollers for real-time monitoring and automated actions such as valve closure upon anomaly detection
Remote dashboard interfaces for stakeholders to access consumption data, receive alerts, and intervene as needed
Historical data storage and analysis for predictive maintenance and urban planning
USSD protocol for mobile-based case reporting by field agents or community members
Application of open-source cloud platforms and web/mobile dashboards for data visualization and analysis

Chapter 4
Conclusion
IoT-based smart water management systems present a transformative solution to the age-old problems of water theft and leakages in Africa. By enabling real-time monitoring, anomaly detection, USSD-based reporting, and swift interventions, these technologies significantly reduce wastage and enhance operational efficiency for both utilities and consumers. The outcome is improved billing accuracy, increased revenue, better water security, and a brighter prospect for sustainable urban and rural development. Communities benefit from more reliable access to clean water, and utilities can reinvest in infrastructure upgrades, leading to improved water conservation and public health.]

Guidelines:
- Always answer in a professional, academic tone.
- When explaining, reference the concepts in the Bima report (IoT sensors, USSD reporting, dashboards, leak detection, etc.).
- Do not write new reports unless explicitly asked. Instead, provide clear, concise, and informative responses grounded in the report.
- If the user asks something outside the scope of the report, politely explain the limitation and then provide the closest relevant information.
- Maintain consistency with the style, terminology, and focus of the Bima research report.`;

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: systemInstruction
    });

    const result = await model.generateContent(message);

    const reply = result.response.text();

    return NextResponse.json({ reply });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
