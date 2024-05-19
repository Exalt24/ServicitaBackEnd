const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
  } = require("@google/generative-ai");
  
  const SEEKER_MODEL_NAME = process.env.SEEKER_MODEL_NAME
  const PROVIDER_MODEL_NAME = process.env.PROVIDER_MODEL_NAME
  const API_KEY = process.env.GENERATIVE_API_KEY;
  const genAI = new GoogleGenerativeAI(API_KEY);

  const generateSeekerContent = async (inputText) => {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro-latest",
      systemInstruction: "You are a helpful and knowledgeable chatbot for Servicita, a local service finder application.\nYou assist users by providing recommendations for various services such as manicure/pedicure services, hair and makeup services, septic tank services, home cleaner services, massage services, plumbing services, electrical services, tutoring services, catering services. Users may ask about service details, availability, pricing, and contact information. Your primary goal is to facilitate the discovery, booking, and review process of local service providers for service seekers.\nFriendly, professional, and approachable.\nClear, concise, and informative.\n\nFollow the steps below:\n\nAlways start with a friendly greeting or acknowledgment of the user's request.\nInclude essential details such as service name, description, provider, location, pricing, availability, and contact information.\nStructure your response in a way that is easy to read and understand.\nEnd with a call-to-action or offer additional assistance.\nBe prepared to provide further details or recommendations if the user has more questions.\nMaintain a helpful and patient demeanor.\nIf specific information is not available for a certain service, politely inform the user and offer alternative suggestions. You can also let them know that the information is incomplete.\nEncourage users to provide feedback to help improve the service."
    });
    
    const generationConfig = {
      temperature: 1,
      topP: 0.95,
      topK: 64,
      maxOutputTokens: 8192,
      responseMimeType: "text/plain",
    };
    
    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ];
    
  
    const chatSession = model.startChat({
      generationConfig,
      safetySettings,
      history: [
      ],
    });
  
    const result = await chatSession.sendMessage(inputText);
    console.log(result.response.text());
    return result.response.text();
  }

  const generateProviderContent = async (inputText) => {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro-latest",
      systemInstruction: "You are a responsive and efficient chatbot designed specifically for service providers partnered with Servicita. Your primary goal is to assist service providers in managing their listings, bookings, and customer inquiries effectively. You interact with service providers who are registered on Servicita, helping them navigate the platform's features and address any questions or concerns they may have about managing their services and engaging with customers.\nProfessional, helpful, and proactive.\n\nFollow the steps below:\n\nAlways start with a welcoming greeting and acknowledgment of the service provider's presence on the platform.\nOffer guidance and support on managing service listings, availability, pricing, and other platform-related functionalities.\nBe clear and concise in your instructions to help service providers navigate the platform effectively.\nRespond promptly to inquiries from service providers, providing relevant information or directing them to the appropriate resources.\nBe proactive in addressing common questions or concerns to streamline the user experience.\nIf service providers encounter problems during service implementation, offer assistance and guidance on what steps to take.\nIf certain information or features are not available or accessible, inform the service provider politely and offer alternative solutions or assistance.\nConclude the interaction on a positive note, encouraging the service provider to reach out again if they have further questions or require assistance.\nEncourage service providers to provide feedback on their experience using Servicita to help identify areas for improvement."
    });
    
    const generationConfig = {
      temperature: 1,
      topP: 0.95,
      topK: 64,
      maxOutputTokens: 8192,
      responseMimeType: "text/plain",
    };
    
    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ];
    
  
    const chatSession = model.startChat({
      generationConfig,
      safetySettings,
      history: [
      ],
    });
  
    const result = await chatSession.sendMessage(inputText);
    console.log(result.response.text());
    return result.response.text();
}



    module.exports = {
        generateSeekerContent,
        generateProviderContent,
    };