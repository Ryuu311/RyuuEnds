
const settings = {
  categories: [
    {
      name: "AI (Artificial Intelligence)",
      items: [
        {
          name: "Chatgpt",
          desc: "Talk Chatgpt",
          path: "/ai/gptturbo?text="
        },
        {
          name: "HydroMind",
          desc: "Talk with hydromind",
          path: "/ai/hydromind?text=&model=",
          innerDesc: "See the list of supported AI models here: https://mind.hydrooo.web.id"
        }
      ]
    },
    {
      name: "Random",
      items: [
        {
          name: "Blue Archive",
          desc: "Blue Archive Random Images",
          path: "/random/ba"
        }
      ]
    },
    {
      name: "Search Tools",
      items: [
        {
          name: "YouTube",
          desc: "Video search",
          path: "/search/youtube?q="
        }
      ]
    },
    {
      name: "Stalk",
      items: [
        {
          name: "Mobile Legends",
          desc: "Stalk akun Mobile Legends",
          path: "/stalk/mlbb?userId=&zoneId="
        },
        {
          name: "Free Fire",
          desc: "Stalk akun Free Fire",
          path: "/stalk/ff?id="
        }
      ]
    },
    {
      name: "Tools",
      items: [
        {
          name: "Fake NGL Generator",
          desc: "Generate pertanyaan dan jawaban gaya NGL",
          path: "/tools/ngl?title=&text="
        },
        {
          name: "Fake TikTok Generator",
          desc: "Buat profil TikTok palsu dengan nama dan foto",
          path: "/tools/faketiktok?name=&username=&pp="
        }
      ]
    }
  ]
};

const buttonsContainer = document.getElementById("category-buttons");
const contentContainer = document.getElementById("category-content");

settings.categories.forEach((category, index) => {
  const button = document.createElement("button");
  button.textContent = category.name;
  button.onclick = () => renderCategory(index);
  buttonsContainer.appendChild(button);
});

function renderCategory(index) {
  const category = settings.categories[index];
  contentContainer.innerHTML = "";
  category.items.forEach(item => {
    const div = document.createElement("div");
    div.className = "api-item";
    div.innerHTML = \`
      <h3>\${item.name}</h3>
      <p>\${item.desc}</p>
      <p><strong>Path:</strong> <code>\${item.path}</code></p>
      \${item.innerDesc ? `<p><em>${item.innerDesc}</em></p>` : ""}
    \`;
    contentContainer.appendChild(div);
  });
}
