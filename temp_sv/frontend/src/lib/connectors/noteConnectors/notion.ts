import type { ConversationMessage } from '$lib/types'
import { buildStudentContext } from '$lib/connectors/contextBuilder'
import { getConnectorKey } from '$lib/stores/connectorStore'

export interface NotionConfig {
    databaseId: string
    apiKey: string
}

const DEFAULT_CONFIG: NotionConfig = {
    databaseId: '',
    apiKey: ''
}

export async function sendToNotion(
    userMessage: string,
    conversationHistory: ConversationMessage[],
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    onError: (error: string) => void
): Promise<void> {

    // get stored api key from IndexedDB
    const apiKey = await getConnectorKey('notion')

    if (!apiKey) {
        onError('Notion API key not found. Please connect Notion in Settings → Connectors.')
        return
    }

    // build student context from local IndexedDB data
    const systemPrompt = await buildStudentContext()

    // Notion-specific context enhancement
    const notionPrompt = `
${systemPrompt}

You are a Notion-integrated AI study assistant.
You have access to the student's Notion workspace and can help with:
- Creating and organizing study pages and databases
- Building study schedules and task trackers
- Managing knowledge bases with linked databases
- Creating templates for different study activities
- Organizing project-based learning

Focus on helping the student build a comprehensive study management system in Notion.
Suggest specific page structures, database configurations, and automation workflows.
`.trim()

    try {
        // Simulate Notion integration (would connect to Notion API in real implementation)
        const notionResponse = await generateNotionResponse(userMessage, notionPrompt, conversationHistory)
        
        // Stream the response
        const words = notionResponse.split(' ')
        let currentText = ''
        
        for (const word of words) {
            currentText += (currentText ? ' ' : '') + word
            onChunk(word + ' ')
            await new Promise(resolve => setTimeout(resolve, 50)) // Simulate streaming
        }
        
        onComplete()

    } catch (err: any) {
        if (err.name === 'TypeError' && err.message.includes('fetch')) {
            onError('Network error. Check your internet connection and try again.')
        } else {
            onError('Failed to connect to Notion. Please try again.')
        }
    }
}

async function generateNotionResponse(userMessage: string, context: string, history: ConversationMessage[]): Promise<string> {
    const input = userMessage.toLowerCase()
    
    if (input.includes('database') || input.includes('track')) {
        return `I'll help you create a comprehensive study tracking database in Notion. Based on your visual learning style, here's a database structure:\n\n**Study Sessions Database**\n\nProperties:\n- Date (Date)\n- Subject (Select: Computer Science, Math, Physics)\n- Topic (Title)\n- Duration (Number: minutes)\n- Progress (Select: Not Started, In Progress, Completed)\n- Tags (Multi-select: Review, Practice, New Concept)\n- Related Pages (Relation)\n- Notes (Text)\n\n**Views to create:**\n1. Calendar View - Schedule visualization\n2. Timeline View - Progress tracking\n3. Board View - Kanban-style task management\n4. Gallery View - Visual topic cards\n\nWould you like me to help you set up this database with specific properties for your current subjects?`
    }
    
    if (input.includes('schedule') || input.includes('plan')) {
        return `Let me create a study schedule system in Notion for you. Here's what I recommend:\n\n**Study Schedule Dashboard**\n\n## Calendar Integration\n- Connect your study database to a calendar view\n- Color-code by subject and difficulty\n- Block study sessions with reminders\n\n## Weekly Planning Template\n# Week of date\n\n## Goals\n- Complete Algorithms chapter 5\n- Practice 10 Data Structures problems\n- Review Complexity Analysis notes\n\n## Daily Schedule\n### Monday\n- 9:00-10:30: Algorithms - Dynamic Programming\n- 2:00-3:30: Data Structures - Tree Traversals\n- 7:00-8:00: Review Previous Topics\n\n## Progress Tracking\n- Sessions completed: 0/5\n- Problems solved: 0/20\n- Understanding level: 0/10\n\n## Automation Ideas\n- Daily check-in templates\n- Weekly progress reports\n- Exam countdown blocks\n\nWould you like me to help you implement this scheduling system?`
    }
    
    if (input.includes('template') || input.includes('page')) {
        return `I'll create a study page template optimized for your visual learning style:\n\n**Study Session Page Template**\n\n---\n\n# Subject Name - Topic Name\n\n> Date: date  \n> Duration: duration minutes  \n> Focus: main_objective\n\n---\n\n## Learning Objectives\n- [ ] \n- [ ] \n- [ ] \n\n## Key Concepts\n| Concept | Definition | Visual Aid | Status |\n|---------|------------|------------|--------|\n|         |            |            |        |\n|         |            |            |        |\n\n## Visual Learning Aids\nCreate flowcharts and mind maps here\n\n## Notes & Insights\n- \n- \n- \n\n## Connections\n- Related: Related Topic\n- Prerequisite: Previous Topic\n- Next: Following Topic\n\n## Practice Problems\n1. \n2. \n3. \n\n## Next Steps\n- [ ] Review notes\n- [ ] Practice problems\n- [ ] Teach someone else\n- [ ] Update Progress Tracker\n\n---\n\n**Tags:** study subject topic\n\nWould you like me to customize this template for a specific subject?`
    }
    
    return `I'm here to help you build your study management system in Notion. Based on your learning profile, I can assist with:\n\n🗂️ Database Design - Custom trackers for subjects, progress, and schedules\n📅 Calendar Integration - Visual planning and time management\n📝 Page Templates - Reusable structures for different study activities\n🔗 Linked Workspaces - Connecting your knowledge across different databases\n📊 Progress Dashboards - Visual tracking of your learning journey\n\nWhat aspect of your Notion study system would you like to work on?`
}

export async function validateNotionKey(apiKey: string): Promise<boolean> {
    try {
        const response = await fetch('https://api.notion.com/v1/users/me', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Notion-Version': '2022-06-28'
            }
        })
        return response.ok
    } catch {
        return false
    }
}
