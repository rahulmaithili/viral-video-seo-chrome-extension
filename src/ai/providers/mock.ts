import { AIProvider } from './base';
import { AIAnalysisRequest, VideoAnalysis, TitleCandidate } from '../../types/ai';
import { CompletePlatformPackage } from '../../types/platform';
import { SupportedLanguage } from '../../types/video';

interface CategoryTemplate {
  category: string;
  subcategory: string;
  niche: string;
  subject: string;
  action: string;
  setting: string;
  emotions: string[];
  audience: string[];
  viralAngle: string;
  facts: {
    brands: string[];
    people: string[];
    animals: string[];
    objects: string[];
  };
  english: {
    summary: string;
    titles: string[];
    caption: string;
    description: string;
    hook: string;
    cta: string;
  };
  hindi: {
    summary: string;
    titles: string[];
    caption: string;
    description: string;
    hook: string;
    cta: string;
  };
  hinglish: {
    summary: string;
    titles: string[];
    caption: string;
    description: string;
    hook: string;
    cta: string;
  };
}

const MOCK_TEMPLATES: Record<string, CategoryTemplate> = {
  dog: {
    category: 'Animals & Pets',
    subcategory: 'Dogs',
    niche: 'Funny Pet Moments',
    subject: 'Golden Retriever',
    action: 'Stealthily trying to grab a slice of pizza off the table',
    setting: 'Living room with coffee table',
    emotions: ['hilarious', 'guilty', 'adorable'],
    audience: ['Dog Lovers', 'Pet Owners', 'Comedy Fans'],
    viralAngle: 'Guilty Pet Caught Red-Handed',
    facts: {
      brands: [],
      people: ['Owner (off-camera)'],
      animals: ['Golden Retriever'],
      objects: ['Pizza slice', 'Box', 'Coffee table'],
    },
    english: {
      summary: 'A clever Golden Retriever slowly sneaks its paw up to steal pizza off the table before getting caught.',
      titles: [
        'He Really Thought Nobody Saw Him Stealing Pizza 😂',
        'Caught In 4K: The Ultimate Pizza Bandit Strikes Again!',
        'When Your Dog Has Zero Self-Control Around Food',
        'Watch His Guilty Face When He Realizes He Got Caught!',
        'The Slow Motion Paw Reach Is Taking Over The Internet',
        'Dog Logic: If You Do It Slowly, It Does Not Count',
        'This Golden Retriever Stole More Than Just Pizza Today',
        'His Reaction At 0:05 Will Make Your Entire Day',
        'Never Leave Food Unattended Around This Mastermind',
        'How Did He Think He Was Going To Get Away With This?!',
      ],
      caption: 'He really acted like nobody could see him moving in super slow motion! 😂🍕 Does your pet pull stunts like this?',
      description: 'Watch what happens when this hungry Golden Retriever thinks the coast is clear. Grounded factual video analysis showing dog reaction around food.',
      hook: 'Watch this paw move... he thought he was completely invisible!',
      cta: 'Double tap if your dog has zero self control around food! 🐕👇',
    },
    hindi: {
      summary: 'एक नटखट गोल्डन रिट्रीवर चुपके से मेज़ से पिज़्ज़ा चुराने की कोशिश करता है और रंगे हाथों पकड़ा जाता है।',
      titles: [
        'इसने सच में सोचा किसी ने पिज़्ज़ा चुराते नहीं देखा 😂',
        'रंगे हाथों पकड़ा गया: सबसे शातिर पिज़्ज़ा चोर!',
        'जब खाने के सामने कुत्ते का कंट्रोल बिल्कुल खत्म हो जाए',
        'पकड़े जाने पर इसका गिल्टी चेहरा देखकर हंसी नहीं रुकेगी!',
        'धीमी चाल से चोरी: क्या मास्टरमाइंड प्लान था!',
        'कुत्ते का लॉजिक: धीरे-धीरे करो तो कोई नहीं देखेगा',
        'इस डॉग ने पिज़्ज़ा ही नहीं, सबका दिल भी चुरा लिया',
        '0:05 पर इसका रिएक्शन आपका पूरा दिन बना देगा',
        'इसके सामने कभी खाना खुला मत छोड़ना!',
        'आखिर ये सोच क्या रहा था? देखिए पूरा वीडियो!',
      ],
      caption: 'इसने सोचा धीमी गति में पंजा बढ़ाएगा तो कोई नहीं देख पाएगा! 😂🍕 क्या आपका पेट भी ऐसी शरारत करता है?',
      description: 'देखिए जब यह प्यारा गोल्डन रिट्रीवर समझता है कि कमरा खाली है। सच्चाई पर आधारित पेट मस्ती वीडियो।',
      hook: 'इसका धीमा पंजा देखिए... इसे लगा कोई देख ही नहीं रहा!',
      cta: 'अगर आपको भी कुत्तों की ये शरारतें पसंद हैं तो लाइक और शेयर जरूर करें! 🐕',
    },
    hinglish: {
      summary: 'Ek naughty Golden Retriever slow motion mein table se pizza steal karne ki try karta hai aur pakda jata hai.',
      titles: [
        'Is Dog Ko Sach Mein Laga Ki Kisi Ne Nahi Dekha 😂',
        'Caught In 4K: Sabse Cute Pizza Thief Pakda Gaya!',
        'Jab Khane Ke Samne Dog Ka Control Khatam Ho Jaye',
        'Caught Hone Par Iska Guilty Face Dekhkar Hasi Nahi Rukegi!',
        'Slow Motion Paw Move Dekho... Ultimate Comedy!',
        'Dog Logic: Agar Slow Move Karoge Toh Koi Nahi Pakad Payega',
        'Is Golden Retriever Ne Pizza Chura Kar Sabka Dil Jeet Liya',
        '0:05 Par Iska Expression Aapka Poora Din Bana Dega',
        'Is Mastermind Ke Samne Kabhi Khana Mat Chhodo!',
        'Aakhir Isko Lag Kya Raha Tha?! Dekho End Tak',
      ],
      caption: 'Isne socha slow motion mein paw move karega toh kisi ko pata nahi chalega! 😂🍕 Kya aapka pet bhi aisi harkat karta hai?',
      description: 'Watch karo jab ye hungry Golden Retriever stealth mode on karta hai. Grounded factual video analysis of pet reactions.',
      hook: 'Iska paw movement dekho... full stealth mode fail ho gaya!',
      cta: 'Double tap karo agar aapka dog bhi food lover hai! 🐕👇',
    },
  },
  food: {
    category: 'Food & Cooking',
    subcategory: 'Recipes',
    niche: 'Artisan Baking',
    subject: 'Chef preparing Neapolitan Pizza',
    action: 'Stretching fermented dough and baking in 900-degree wood-fired oven',
    setting: 'Pizzeria kitchen with brick oven',
    emotions: ['satisfying', 'mouthwatering', 'hypnotic'],
    audience: ['Foodies', 'Home Cooks', 'Pizza Enthusiasts'],
    viralAngle: 'Ultimate Dough Bubble ASMR & Crust Rise',
    facts: {
      brands: [],
      people: ['Pizzaiolo'],
      animals: [],
      objects: ['Pizza peel', 'Wood-fired oven', 'Mozzarella', 'Basil', 'San Marzano tomatoes'],
    },
    english: {
      summary: 'Expert chef shapes 72-hour fermented dough and bakes an authentic Margherita pizza in a wood-fired oven.',
      titles: [
        'The 90-Second Neapolitan Pizza Rise You Cannot Look Away From',
        'Why 72-Hour Fermented Dough Creates The Ultimate Crust Crust',
        'The Exact Way Real Italian Chefs Stretch Pizza Dough',
        'Watch This Dough Bubble Explode Inside A 900-Degree Oven',
        'From Raw Flour To Pure Perfection In Under 2 Minutes',
        'The Secret Technique To Getting That Leopard-Spotted Crust',
        'Stop Rolling Your Dough! Do This Instead For Perfect Air Pockets',
        'This Wood-Fired Pizza Slice Pull Will Make You Hungry Instantly',
        'How A Master Pizzaiolo Crafts The Iconic Margherita',
        'The Most Satisfying Pizza Crust Bake Captured On Camera',
      ],
      caption: 'Watch that dough puff up in seconds! 🍕 72-hour cold fermentation makes all the difference in that airy crust. Would you eat this whole pie?',
      description: 'Master artisan demonstrates authentic dough shaping and rapid 900-degree oven baking. Pure culinary technique grounded in tradition.',
      hook: 'Watch the crust inflate the moment it hits the stone...',
      cta: 'Save this recipe video and tag your favorite pizza buddy! 🍕',
    },
    hindi: {
      summary: 'शेफ द्वारा लकड़ी की भट्टी में पारम्परिक इटैलियन मार्गरिटा पिज़्ज़ा बनाने की कला का प्रदर्शन।',
      titles: [
        '90 सेकंड में भट्टी में फूलता हुआ इटैलियन पिज़्ज़ा क्रस्ट',
        '72 घंटे फर्मेंटेड आटे से ऐसा क्रस्ट कैसे बनता है?',
        'इटैलियन शेफ किस तरह पिज़्ज़ा का आटा फैलाते हैं देखिए',
        '900 डिग्री की भट्टी में पिज़्ज़ा का यह रूप हैरान कर देगा',
        'कच्चे आटे से 2 मिनट में तैयार हुआ लाजवाब पिज़्ज़ा',
        'कुरकुरा और स्पंजी पिज़्ज़ा बनाने की असली तकनीक',
        'बेलन का इस्तेमाल बंद करें! इस तरीके से पिज़्ज़ा बनाएं',
        'यह मेल्टेड चीज़ देखकर आपके मुंह में पानी आ जाएगा',
        'पारंपरिक मार्गरिटा पिज़्ज़ा बनाने का जादुई तरीका',
        'सोशल मीडिया पर सबसे ज्यादा देखा जाने वाला बेकिंग वीडियो',
      ],
      caption: 'भट्टी में जाते ही आटा कैसे फूला देखिए! 🍕 72 घंटे का फर्मेंटेशन ही असली स्वाद का राज़ है। क्या आप इसे चखना चाहेंगे?',
      description: 'पारंपरिक लकड़ी की भट्टी में तैयार शुद्ध इटैलियन मार्गरिटा पिज़्ज़ा। बेकिंग की अद्भुत तकनीक।',
      hook: 'पत्थर की भट्टी पर पड़ते ही क्रस्ट का फूलना देखिए...',
      cta: 'यह वीडियो सेव करें और अपने फूडी दोस्तों के साथ शेयर करें! 🍕',
    },
    hinglish: {
      summary: 'Chef 72-hour fermented dough ko stretch karke wood-fired oven mein authentic pizza bake karta hai.',
      titles: [
        '90 Seconds Mein Dough Ka Rise Dekhkar Maza Aa Jayega!',
        '72-Hour Fermentation Se Itna Soft Crust Kaise Banta Hai?',
        'Italian Chefs Kaise Dough Stretch Karte Hain Dekho',
        '900 Degree Oven Mein Pizza Ka Ye Magic Dekho',
        'Raw Dough Se 2 Minutes Mein Ready Perfect Margherita',
        'Crispy Aur Airy Crust Banane Ki Secret Technique',
        'Belan Use Karna Chhodo! Ye Professional Trick Dekho',
        'Ye Cheese Pull Dekhkar Instant Bhookh Lag Jayegi',
        'Master Pizzaiolo Ka Iconic Pizza Making Style',
        'Internet Ka Most Satisfying Pizza Baking Moment',
      ],
      caption: 'Oven mein jaate hi dough kaise rise hua dekho! 🍕 Fermentation hi asli airy texture deta hai. Try karoge?',
      description: 'Authentic dough technique in traditional wood-fired oven. Pure culinary satisfaction grounded in real facts.',
      hook: 'Oven ke andar crust ka puff hona dekho...',
      cta: 'Save karo aur apne pizza lover friend ko tag karo! 🍕👇',
    },
  },
  tech: {
    category: 'Technology & AI',
    subcategory: 'Gadgets',
    niche: 'Flagship Smartphone Review',
    subject: 'Flagship Smartphone',
    action: 'Unboxing, matte glass reveal, and 100x zoom camera test',
    setting: 'Studio desk with warm cinematic lighting',
    emotions: ['impressed', 'curious', 'tech-savvy'],
    audience: ['Tech Enthusiasts', 'Mobile Gamers', 'Gadget Buyers'],
    viralAngle: 'Mind-Blowing Camera Sensor Test',
    facts: {
      brands: [],
      people: ['Reviewer hands'],
      animals: [],
      objects: ['Smartphone', 'Unboxing box', 'Tripod', 'Camera lens'],
    },
    english: {
      summary: 'Unboxing of a flagship smartphone showcasing slim bezel design and testing optical zoom performance.',
      titles: [
        'I Tested The 100x Zoom On This Flagship And Did Not Expect This',
        'Unboxing The Thinnest Flagship Phone Of 2026: Hands-On Look',
        'Is This Camera Upgrade Actually Worth Your Money?',
        'The Build Quality On This Device Feels Insane In The Hand',
        'Watch What Happens When You Zoom Into That Distant Tower',
        '3 Game-Changing Features Nobody Is Talking About Yet',
        'The Matte Finish On This Titanium Frame Is Gorgeous',
        'Display Brightness Test Under Direct Harsh Sunlight',
        'Real World Hands-On: First 24 Hours With This Flagship',
        'Why This Might Be The Best Smartphone Camera Sensor This Year',
      ],
      caption: 'Testing the optics on this new flagship. That zoom stabilization surprised me in real testing! What phone are you rocking right now?',
      description: 'Complete hands-on unboxing and optical clarity demonstration. Factual hardware specs and design assessment.',
      hook: 'Look closely at that window two blocks away...',
      cta: 'Drop a comment with your current phone and follow for battery results! 📱',
    },
    hindi: {
      summary: 'नए फ्लैगशिप स्मार्टफोन की अनबॉक्सिंग और 100x ज़ूम कैमरा की असल क्षमता का परीक्षण।',
      titles: [
        'इस फ्लैगशिप के 100x ज़ूम टेस्ट ने सबको हैरान कर दिया',
        'साल 2026 का सबसे स्लिम फ्लैगशिप फोन: पहली झलक',
        'क्या यह नया कैमरा अपग्रेड सच में पैसे वसूल है?',
        'हाथ में पकड़ते ही इसका प्रीमियम टाइटेनियम फ्रेम महसूस होता है',
        'दूर की इमारत पर ज़ूम करते ही क्या दिखा देखिए',
        '3 ऐसे कमाल के फीचर्स जिनके बारे में कोई बात नहीं कर रहा',
        'तेज धूप में इसकी स्क्रीन की ब्राइटनेस कैसी है?',
        'मेट फिनिश और प्रीमियम लुक: अनबॉक्सिंग अनुभव',
        'पहले 24 घंटे का रियल-वर्ल्ड यूजर एक्सपीरियंस',
        'क्या यह इस साल का सबसे बेहतरीन स्मार्टफोन कैमरा है?',
      ],
      caption: 'इस नए फोन का कैमरा टेस्ट! ज़ूम स्टेबिलाइज़ेशन ने सच में इम्प्रेस किया। अभी आप कौन सा फोन इस्तेमाल कर रहे हैं?',
      description: 'फ्लैगशिप फोन की विस्तृत अनबॉक्सिंग और कैमरा टेस्ट। बिना किसी पक्षपात के निष्पक्ष टेक विश्लेषण।',
      hook: 'दो किलोमीटर दूर की इमारत पर ज़ूम का असर देखिए...',
      cta: 'कमेंट में बताएं आपका पसंदीदा फोन कौन सा है! 📱',
    },
    hinglish: {
      summary: 'New flagship smartphone ki unboxing aur 100x zoom camera test ka hands-on review.',
      titles: [
        'Is Phone Ka 100x Zoom Test Karke Shocking Result Mila!',
        '2026 Ka Sabse Slim Flagship Phone: First Look & Unboxing',
        'Kya Ye Naya Camera Upgrade Worth It Hai Ya Hype?',
        'Hand Feel Aur Titanium Frame Ki Quality Next Level Hai',
        'Distant Tower Par Zoom Karke Dekha Toh Shocking Clarity Mili',
        '3 Top Features Jo Brands Highlight Karna Bhool Gaye',
        'Direct Sunlight Mein Display Brightness Ka Asli Test',
        'Matte Glass Finish Premium Vibes Deta Hai',
        'First 24 Hours Real Life Experience With This Beast',
        'Best Smartphone Camera Of The Year? Honest Hands-on',
      ],
      caption: 'Optics aur zoom stabilization check karo! Reality test mein performance solid hai. Aap kaunsa phone use kar rahe ho?',
      description: 'Flagship unboxing and camera clarity demo. Honest tech analysis grounded in actual device testing.',
      hook: 'Distant object par 100x zoom lagaya aur ye dekho...',
      cta: 'Comment karke batao aapka current phone! Follow for full review 📱',
    },
  },
};

export class MockAIProvider implements AIProvider {
  name = 'Mock AI Provider (Offline Dev & Testing)';

  private matchCategory(filename: string): CategoryTemplate {
    const lower = filename.toLowerCase();
    if (lower.includes('dog') || lower.includes('cat') || lower.includes('pet') || lower.includes('animal')) {
      return MOCK_TEMPLATES.dog;
    }
    if (lower.includes('food') || lower.includes('cook') || lower.includes('pizza') || lower.includes('recipe') || lower.includes('kitchen')) {
      return MOCK_TEMPLATES.food;
    }
    if (lower.includes('tech') || lower.includes('phone') || lower.includes('review') || lower.includes('gadget') || lower.includes('mobile')) {
      return MOCK_TEMPLATES.tech;
    }
    // Default cycle
    return MOCK_TEMPLATES.dog;
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    await new Promise((r) => setTimeout(r, 200));
    return { success: true, message: 'Mock AI provider is ready and functional.' };
  }

  async analyzeVideo(req: AIAnalysisRequest): Promise<VideoAnalysis> {
    // Simulate brief realistic async analysis delay (300ms)
    await new Promise((r) => setTimeout(r, 400));

    const tpl = this.matchCategory(req.filename);
    const isHindi = req.language === 'Hindi';
    const isHinglish = req.language === 'Hinglish';

    const langData = isHindi ? tpl.hindi : isHinglish ? tpl.hinglish : tpl.english;

    return {
      videoId: req.videoId,
      summary: langData.summary,
      category: tpl.category,
      subcategory: tpl.subcategory,
      niche: tpl.niche,
      contentType: 'Short-Form Video',
      confidence: 'High',
      facts: {
        subject: tpl.subject,
        action: tpl.action,
        setting: tpl.setting,
        emotions: tpl.emotions,
        location: null,
        locationConfidence: 0,
        brands: tpl.facts.brands,
        people: tpl.facts.people,
        animals: tpl.facts.animals,
        objects: tpl.facts.objects,
        onScreenText: [],
        confidence: 0.96,
      },
      scenes: [
        { timeRange: '00:00-00:02', description: 'Immediate visual hook', type: 'hook' },
        { timeRange: '00:02-00:06', description: 'Core action progression', type: 'action' },
        { timeRange: '00:06-00:09', description: 'Emotional payoff and climax', type: 'payoff' },
      ],
      targetAudience: tpl.audience,
      viralAngles: [
        { id: 'angle-1', name: tpl.viralAngle, hookIdea: langData.hook, score: 94, selected: true },
        { id: 'angle-2', name: 'Curiosity Loop', hookIdea: 'Watch until the very end...', score: 86, selected: false },
        { id: 'angle-3', name: 'Relatable Everyday Humor', hookIdea: 'Who else does this?', score: 82, selected: false },
      ],
      bestViralAngle: tpl.viralAngle,
      viralScore: {
        overallScore: 89,
        hookPotential: 92,
        retentionPotential: 88,
        clarity: 95,
        emotion: 90,
        originality: 84,
        shareability: 91,
        commentPotential: 87,
        explanation: 'Strong opening hook within 2 seconds with high relatable emotional payoff.',
      },
      keywords: [
        { term: tpl.subject, category: 'primary', relevanceScore: 98, trendScore: null, platformScore: 94, opportunityScore: 96 },
        { term: tpl.niche, category: 'secondary', relevanceScore: 92, trendScore: null, platformScore: 88, opportunityScore: 90 },
        { term: tpl.viralAngle, category: 'long_tail', relevanceScore: 88, trendScore: null, platformScore: 85, opportunityScore: 86 },
        { term: 'viral video', category: 'search_intent', relevanceScore: 80, trendScore: null, platformScore: 82, opportunityScore: 81 },
      ],
      explanation: {
        whyThisTitle: 'Accurately captures the main visual action while creating strong viewer curiosity without misleading claims.',
        whyTheseKeywords: 'Grounded directly in detected subjects and actions with relevance score above 80%.',
        whyThisViralScore: 'Reflects fast pacing, clear subject matter, and high potential comment engagement.',
      },
    };
  }

  async generatePlatformPackage(
    analysis: VideoAnalysis,
    language: SupportedLanguage,
    targetUsa: boolean,
    _customInstructions?: string,
    _templateStyle?: string
  ): Promise<CompletePlatformPackage> {
    await new Promise((r) => setTimeout(r, 300));

    const tpl = this.matchCategory(analysis.facts.subject);
    const isHindi = language === 'Hindi';
    const isHinglish = language === 'Hinglish';
    const langData = isHindi ? tpl.hindi : isHinglish ? tpl.hinglish : tpl.english;

    const titles: TitleCandidate[] = langData.titles.map((t, i) => ({
      title: t,
      hookScore: 92 - i,
      clarityScore: 94 - Math.floor(i / 2),
      relevanceScore: 98,
      searchScore: 90 - i,
      shareabilityScore: 91 - i,
      overallScore: 93 - i,
      isBest: i === 0,
    }));

    return {
      videoId: analysis.videoId,
      language,
      targetUsa,
      youtube: {
        titleCandidates: titles,
        bestTitle: titles[0].title,
        titleScore: 93,
        shortDescription: langData.description,
        longDescription: `${langData.description}\n\nKey Highlights:\n- ${analysis.scenes.map((s) => s.timeRange + ' ' + s.description).join('\n- ')}\n\nSubscribe for daily updates!`,
        seoDescription: `${langData.description} Explore ${analysis.category} and ${analysis.niche} trends.`,
        tags: [analysis.facts.subject, analysis.category, analysis.niche, 'viral shorts', 'trending'],
        hashtags: [`#${analysis.category.replace(/\s+/g, '')}`, `#${analysis.niche.replace(/\s+/g, '')}`, '#Shorts', '#Viral'],
        primaryKeywords: [analysis.facts.subject, analysis.category],
        secondaryKeywords: [analysis.niche, 'tips', 'highlights'],
        longTailKeywords: [`best ${analysis.facts.subject} moments`, `how to ${analysis.facts.action}`],
        searchIntent: 'High entertainment and curiosity search intent',
        hook: langData.hook,
        cta: langData.cta,
      },
      facebook: {
        headline: titles[0].title,
        caption: langData.caption,
        description: langData.description,
        hashtags: [`#${analysis.category.replace(/\s+/g, '')}`, '#ViralVideo', '#MustWatch'],
        keywords: [analysis.facts.subject, analysis.niche],
        cta: langData.cta,
        engagementPrompt: 'Who needs to see this right now? Tag them below! 👇',
        shortVersion: langData.caption,
        longVersion: `${langData.caption}\n\n${langData.description}`,
      },
      instagram: {
        reelHook: langData.hook,
        firstLine: titles[0].title,
        caption: `${langData.caption}\n.\n.\n#reels #${analysis.category.replace(/\s+/g, '')} #explore #viral`,
        searchKeywords: [analysis.facts.subject, analysis.niche, 'reels'],
        hashtags: ['#reels', '#viralreels', '#explorepage', `#${analysis.category.replace(/\s+/g, '')}`],
        cta: langData.cta,
      },
      generatedAt: Date.now(),
    };
  }

  async regenerateTitles(
    analysis: VideoAnalysis,
    language: SupportedLanguage,
    targetUsa: boolean
  ): Promise<TitleCandidate[]> {
    const pkg = await this.generatePlatformPackage(analysis, language, targetUsa);
    return pkg.youtube.titleCandidates;
  }
}
