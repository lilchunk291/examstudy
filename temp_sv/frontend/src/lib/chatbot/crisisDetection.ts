// Crisis Language Detection - Section 3.8
// NON-NEGOTIABLE safety system

export interface CrisisTrigger {
  detected: boolean;
  category: 'self_harm' | 'hopelessness' | 'worthlessness' | 'suicidal';
  resources: { name: string; phone: string }[];
}

const CRISIS_PHRASES = {
  self_harm: [
    'want to hurt myself',
    'want to harm myself',
    'hurt myself',
    'self harm',
    'self-harm'
  ],
  suicidal: [
    'want to kill myself',
    'want to die',
    'want to disappear',
    'want to end it',
    'want to end my life',
    'kill myself',
    'end my life',
    'disappear',
    'can\'t go on',
    'want this all to stop'
  ],
  hopeless: [
    'don\'t see the point of anything',
    'don\'t see point of anything',
    'nothing matters',
    'doesn\'t matter',
    'pointless',
    'worthless',
    'no point',
    'hopeless'
  ],
  worthlessness: [
    'nobody would notice',
    'no one would notice',
    'nobody would care',
    'no one would care',
    'not worth it anymore',
    'worthless',
    'failure'
  ]
};

const CRISIS_RESOURCES = {
  india: [
    { name: 'iCall India', phone: '9152987821' },
    { name: 'Vandrevala Foundation', phone: '1860-2662-345' }
  ],
  global: [
    { name: 'Local emergency services', phone: '911' },
    { name: 'Crisis hotline', phone: '988' }
  ]
};

export function detectCrisisLanguage(message: string): CrisisTrigger {
  const normalizedMessage = message.toLowerCase().trim();
  
  for (const [category, phrases] of Object.entries(CRISIS_PHRASES)) {
    for (const phrase of phrases) {
      if (normalizedMessage.includes(phrase)) {
        return {
          detected: true,
          category: category as CrisisTrigger['category'],
          resources: CRISIS_RESOURCES.india
        };
      }
    }
  }
  
  return {
    detected: false,
    category: 'self_harm',
    resources: []
  };
}

export function getCrisisResponse(trigger: CrisisTrigger): string {
  if (!trigger.detected) {
    return '';
  }
  
  return `This sounds like more than exam stress.
Please talk to someone right now.

${trigger.resources.map(resource => `${resource.name}: ${resource.phone}`).join('\n')}

Or tell a friend or family member what you just told me.`;
}

export function shouldLogCrisisTrigger(trigger: CrisisTrigger): boolean {
  return trigger.detected;
}

export function getCrisisTriggerCategory(trigger: CrisisTrigger): string {
  return trigger.category;
}
