const voice = await fetch("https://main-agentcore.fly.dev/gen?voice=grandma").then(r => r.text());
console.log("Grandma says:", voice);
