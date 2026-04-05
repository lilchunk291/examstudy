export class Naturalizer {
  private contractions = {
    "I am": "I'm",
    "I have": "I've",
    "I will": "I'll",
    "I would": "I'd",
    "I had": "I'd",
    "you are": "you're",
    "you have": "you've",
    "you will": "you'll",
    "you would": "you'd",
    "we are": "we're",
    "we have": "we've",
    "we will": "we'll",
    "we would": "we'd",
    "they are": "they're",
    "they have": "they've",
    "they will": "they'll",
    "they would": "they'd",
    "it is": "it's",
    "it has": "it's",
    "it will": "it'll",
    "that is": "that's",
    "that has": "that's",
    "that will": "that'll",
    "there is": "there's",
    "there has": "there's",
    "there will": "there'll",
    "what is": "what's",
    "what has": "what's",
    "what will": "what'll",
    "where is": "where's",
    "where has": "where's",
    "where will": "where'll",
    "when is": "when's",
    "when has": "when's",
    "when will": "when'll",
    "why is": "why's",
    "why has": "why's",
    "why will": "why'll",
    "how is": "how's",
    "how has": "how's",
    "how will": "how'll",
    "who is": "who's",
    "who has": "who's",
    "who will": "who'll",
    "cannot": "can't",
    "do not": "don't",
    "does not": "doesn't",
    "did not": "didn't",
    "will not": "won't",
    "would not": "wouldn't",
    "should not": "shouldn't",
    "could not": "couldn't",
    "might not": "mightn't",
    "must not": "mustn't",
    "shall not": "shan't",
    "are not": "aren't",
    "is not": "isn't",
    "was not": "wasn't",
    "were not": "weren't",
    "have not": "haven't",
    "has not": "hasn't",
    "had not": "hadn't"
  };

  private emotionalOpenings = {
    anxious: [
      "I understand you're feeling anxious about this.",
      "It's completely normal to feel anxious when facing challenges.",
      "Let's take this step by step to ease your anxiety.",
      "I can see this is making you anxious, and that's okay."
    ],
    frustrated: [
      "I can hear your frustration, and that's completely valid.",
      "It sounds like you're feeling stuck, which can be really frustrating.",
      "I understand your frustration - let's find a way forward.",
      "That does sound frustrating. Let's work through this together."
    ],
    tired: [
      "I can tell you're feeling tired, and that's understandable.",
      "When we're tired, everything feels harder. Let's be gentle with ourselves.",
      "It sounds like you need some rest. Let's make this manageable.",
      "I hear that you're exhausted. Let's keep things simple for now."
    ],
    confused: [
      "I can see you're feeling confused, and that's okay.",
      "It makes sense that you're confused - this can be complex.",
      "Let me help clarify this for you.",
      "I understand your confusion. Let's break this down."
    ],
    motivated: [
      "I love that you're feeling motivated!",
      "It's great to see your enthusiasm!",
      "Your motivation is wonderful - let's channel that energy.",
      "I can feel your excitement - that's fantastic!"
    ],
    hopeless: [
      "I hear that you're feeling hopeless, but I want you to know things can get better.",
      "It sounds like you're feeling hopeless right now, but that feeling isn't permanent.",
      "I understand you're feeling hopeless, but you've overcome challenges before.",
      "I know it feels hopeless now, but you're stronger than you think."
    ],
    confident: [
      "I love your confidence!",
      "It's great that you're feeling confident about this.",
      "Your confidence will help you succeed.",
      "I can see you're feeling confident - that's the right attitude!"
    ],
    neutral: [
      "I understand what you're saying.",
      "Thanks for sharing that with me.",
      "I see what you mean.",
      "That makes sense."
    ]
  };

  private sentenceVariations = {
    short: ["Let's focus on", "We can", "Try to", "Consider", "Think about"],
    medium: ["Let's take a moment to focus on", "What we can do is", "I suggest we consider", "It might help to think about"],
    long: ["Let's take a step back and really focus on", "What I think would be most helpful is if we consider", "I believe it would be beneficial to take some time to think about"]
  };

  private followUpQuestions = [
    "How does that sound to you?",
    "What do you think about that?",
    "Does that make sense?",
    "How would you feel about trying that?",
    "Would you like me to explain more?",
    "Is there anything specific you'd like to focus on?",
    "What are your thoughts on this approach?",
    "Does this resonate with you?"
  ];

  /**
   * Naturalize text based on emotion and context
   */
  naturalize(text: string, emotion: string): string {
    let naturalized = text;

    // Apply contractions
    naturalized = this.applyContractions(naturalized);

    // Vary sentence length
    naturalized = this.varySentenceLength(naturalized);

    // Add emotional acknowledgment if appropriate
    naturalized = this.addEmotionalAcknowledgment(naturalized, emotion);

    // Add natural breaks and transitions
    naturalized = this.addNaturalBreaks(naturalized);

    // Add follow-up questions occasionally
    naturalized = this.addFollowUpQuestions(naturalized);

    // Ensure it doesn't sound robotic
    naturalized = this.removeRoboticPhrases(naturalized);

    return naturalized;
  }

  /**
   * Apply contractions to make text more natural
   */
  private applyContractions(text: string): string {
    let result = text;

    // Apply contractions (case-insensitive)
    for (const [formal, contraction] of Object.entries(this.contractions)) {
      const regex = new RegExp(`\\b${formal}\\b`, 'gi');
      result = result.replace(regex, contraction);
    }

    return result;
  }

  /**
   * Vary sentence length for natural flow
   */
  private varySentenceLength(text: string): string {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    if (sentences.length <= 1) return text;

    const variedSentences = sentences.map((sentence, index) => {
      const trimmed = sentence.trim();
      
      // Vary sentence structure based on position
      if (index % 3 === 0 && trimmed.length > 20) {
        // Make some sentences shorter
        const words = trimmed.split(' ');
        if (words.length > 10) {
          return words.slice(0, Math.floor(words.length * 0.6)).join(' ');
        }
      } else if (index % 3 === 1 && trimmed.length < 30) {
        // Make some sentences longer
        const variation = this.sentenceVariations.medium[Math.floor(Math.random() * this.sentenceVariations.medium.length)];
        return `${variation} ${trimmed}`;
      }
      
      return trimmed;
    });

    return variedSentences.join('. ') + '.';
  }

  /**
   * Add emotional acknowledgment at the beginning
   */
  private addEmotionalAcknowledgment(text: string, emotion: string): string {
    if (Math.random() > 0.3) return text; // Only add 70% of the time

    const openings = this.emotionalOpenings[emotion as keyof typeof this.emotionalOpenings];
    if (!openings || openings.length === 0) return text;

    const opening = openings[Math.floor(Math.random() * openings.length)];
    
    // Add opening if it doesn't already sound similar
    if (!text.toLowerCase().includes(opening.toLowerCase().substring(0, 10))) {
      return `${opening} ${text}`;
    }

    return text;
  }

  /**
   * Add natural breaks with em dashes
   */
  private addNaturalBreaks(text: string): string {
    if (Math.random() > 0.4) return text; // Only add 60% of the time

    const sentences = text.split('.');
    const modifiedSentences = sentences.map((sentence, index) => {
      if (index === sentences.length - 1) return sentence; // Don't modify last sentence
      
      const trimmed = sentence.trim();
      if (trimmed.length > 30 && Math.random() > 0.5) {
        // Add em dash break in longer sentences
        const words = trimmed.split(' ');
        const breakPoint = Math.floor(words.length * 0.6);
        const firstPart = words.slice(0, breakPoint).join(' ');
        const secondPart = words.slice(breakPoint).join(' ');
        return `${firstPart} — ${secondPart}`;
      }
      
      return trimmed;
    });

    return modifiedSentences.join('. ');
  }

  /**
   * Add follow-up questions occasionally
   */
  private addFollowUpQuestions(text: string): string {
    if (Math.random() > 0.25) return text; // Only add 25% of the time

    const question = this.followUpQuestions[Math.floor(Math.random() * this.followUpQuestions.length)];
    
    // Don't add if text already ends with a question
    if (text.trim().endsWith('?')) return text;

    return `${text} ${question}`;
  }

  /**
   * Remove robotic phrases and overly formal language
   */
  private removeRoboticPhrases(text: string): string {
    const roboticPhrases = [
      "As an AI assistant",
      "I am an AI",
      "As a language model",
      "I am designed to",
      "My purpose is to",
      "I am programmed to",
      "According to my programming",
      "Based on my algorithms",
      "In my capacity as",
      "Please be advised that"
    ];

    let result = text;
    
    for (const phrase of roboticPhrases) {
      const regex = new RegExp(phrase, 'gi');
      result = result.replace(regex, '');
    }

    // Remove double spaces and clean up
    result = result.replace(/\s+/g, ' ').trim();
    
    return result;
  }

  /**
   * Add context references from memory
   */
  addContextReferences(text: string, context: any[]): string {
    // This would integrate with contextMemory to add natural references
    // For now, return the text as-is
    return text;
  }

  /**
   * Ensure response is unique (never identical to previous)
   */
  makeUnique(text: string, previousResponses: string[]): string {
    // Check if this response is too similar to previous ones
    for (const previous of previousResponses.slice(-5)) { // Check last 5 responses
      if (this.calculateSimilarity(text, previous) > 0.8) {
        // Add variation if too similar
        return this.addVariation(text);
      }
    }
    
    return text;
  }

  /**
   * Calculate similarity between two texts
   */
  private calculateSimilarity(text1: string, text2: string): number {
    const words1 = text1.toLowerCase().split(' ');
    const words2 = text2.toLowerCase().split(' ');
    
    const commonWords = words1.filter(word => words2.includes(word));
    
    return commonWords.length / Math.max(words1.length, words2.length);
  }

  /**
   * Add variation to make response unique
   */
  private addVariation(text: string): string {
    const variations = [
      "Let me approach this differently.",
      "Here's another way to think about it.",
      "Consider this perspective as well.",
      "I'd also suggest thinking about it this way."
    ];

    const variation = variations[Math.floor(Math.random() * variations.length)];
    return `${variation} ${text}`;
  }
}

export const naturalizer = new Naturalizer();
