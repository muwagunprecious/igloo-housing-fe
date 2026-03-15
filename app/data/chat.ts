export const conversations = [
    {
        id: "chat1",
        agentId: "agent1",
        agentName: "Agent John",
        agentAvatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80",
        lastMessage: "Is the self-contained apartment still available?",
        timestamp: "10:30 AM",
        unread: 2,
        messages: [
            {
                id: "m1",
                sender: "user",
                text: "Hi, I'm interested in the self-contained apartment.",
                timestamp: "10:00 AM"
            },
            {
                id: "m2",
                sender: "agent",
                text: "Hello! Yes, it is currently available. Would you like to schedule a viewing?",
                timestamp: "10:05 AM"
            },
            {
                id: "m3",
                sender: "user",
                text: "Yes please, is tomorrow okay?",
                timestamp: "10:15 AM"
            },
            {
                id: "m4",
                sender: "agent",
                text: "Tomorrow works. 2 PM?",
                timestamp: "10:30 AM"
            }
        ]
    },
    {
        id: "chat2",
        agentId: "agent2",
        agentName: "Sarah Smith",
        agentAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80",
        lastMessage: "The rent is negotiable.",
        timestamp: "Yesterday",
        unread: 0,
        messages: [
            {
                id: "m1",
                sender: "user",
                text: "What is the final price for the shared room?",
                timestamp: "Yesterday"
            },
            {
                id: "m2",
                sender: "agent",
                text: "The rent is negotiable. We can do 140k.",
                timestamp: "Yesterday"
            }
        ]
    }
];
