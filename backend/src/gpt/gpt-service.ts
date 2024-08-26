import { OpenAI } from "openai";
import "dotenv/config";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateText(noteData) {
  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `Based on the provided lecture presentation data, generate a set of interconnected Obsidian notes in Zettelkasten style. Obsidian is a note-taking app that uses markdown format. Your task is to create concise, atomic notes that capture individual concepts or ideas from the lecture, ensuring that each note is detailed yet focuses only on information from the provided data.

        **Key Requirements:**
        - **File Name:** Each note should have a clear, specific file name.
        - **Tags:** Include relevant tags, prefixed with #.
        - **Links:** Create contextually relevant links to related notes using double square brackets [[]]. 
        - **Main Content:** Focus each note on one key concept, presented in a clear, concise manner.
        - **Structure:** Use bullet points or short paragraphs for clarity.

        Please ensure that the JSON response is well-formed and valid. Check for any unescaped characters or formatting issues before finalizing the output.
        ALWAYS Return an array of JSON objects, structured as follows:
        {
          "notes": [
            {
              "fileName": "Water Cycle Overview",
              "content": "# Water Cycle Overview\n\nTags: #water-cycle #hydrology #earth-science\n\nLinks: [[Evaporation in the Water Cycle]], [[Transpiration in the Water Cycle]], [[Condensation in the Water Cycle]], [[Precipitation in the Water Cycle]], [[Runoff in the Water Cycle]]\n\nThe water cycle, also known as the hydrologic cycle, describes the continuous movement of water within the Earth and atmosphere. It is a complex system that includes many different processes:\n\n- Evaporation\n- Transpiration\n- Condensation\n- Precipitation\n- Runoff\n\nThese processes work together to circulate water throughout the Earth's systems."
            },
            {
              "fileName": "Evaporation in the Water Cycle",
              "content": "# Evaporation in the Water Cycle\n\nTags: #water-cycle #evaporation #phase-change\n\nLinks: [[Water Cycle Overview]], [[Condensation in the Water Cycle]]\n\nEvaporation is a key process in the water cycle:\n\n- Occurs when the sun heats up water in rivers, lakes, or oceans\n- Water turns into vapor or steam\n- Moves water from liquid to gas state in the atmosphere"
            },
            {
              "fileName": "Transpiration in the Water Cycle",
              "content": "# Transpiration in the Water Cycle\n\nTags: #water-cycle #transpiration #plants #botany\n\nLinks: [[Water Cycle Overview]], [[Evaporation in the Water Cycle]]\n\nTranspiration is the process by which moisture moves through plants:\n\n- Water travels from roots to small pores on the underside of leaves\n- Changes to vapor at the leaves\n- Released into the atmosphere\n- Contributes to the water cycle alongside evaporation"
            }
          ]
        }
        Try to create as much notes as possible.
        `,
      },
      { role: "user", content: noteData },
    ],
    model: "gpt-4o-mini",
    temperature: 0.6,
    response_format: { type: "json_object" },
  });
  //@ts-ignore
  const js = JSON.parse(completion.choices[0].message.content);
  return js;
}

export async function generateQuiz(noteData, numQuestions) {
  const seed = Date.toString();

  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `You are an expert quiz creator. Your task is to generate a unique quiz based on the provided notes. Create ${numQuestions} multiple-choice questions that accurately reflect the content of the notes. Each question should have 4 choices, with only one correct answer. Ensure that the questions cover a range of difficulty levels and topics from the notes.
        -generate quiz in the language that is provided
        Important: Use the seed value "${seed}" to generate a unique set of questions. Each time this seed changes, you must produce entirely different questions, even if the note content remains the same.

        Return your response as a JSON object in the following format:
        {
          "questions": [
            {
              "id": 1,
              "question": "What is the primary function of mitochondria in a cell?",
              "choices": [
                "Protein synthesis",
                "Energy production",
                "Cell division",
                "Waste removal"
              ],
              "answer": "Energy production",
              "explanation": "Mitochondria are often referred to as the 'powerhouses' of the cell because they generate most of the cell's supply of adenosine triphosphate (ATP), used as a source of chemical energy."
            }
          ]
        }

        Ensure that:
        1. Questions are clear, concise, and directly related to the provided notes.
        2. All choices are plausible, with only one being correct.
        3. The correct answer is accurately indicated.
        4. The explanation provides a brief but informative justification for the correct answer.
        5. The difficulty of questions varies to test different levels of understanding.
        6. Questions are diverse and cover different aspects of the notes each time.`,
      },
      { role: "user", content: noteData },
    ],
    model: "gpt-4o-mini",
    temperature: 0.8,
    response_format: { type: "json_object" },
  });

  return completion.choices[0].message.content;
}
