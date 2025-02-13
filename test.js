const fetchWish = async () => {
  const res =await fetch(`https://api.wishlink.dev/whereiswishi?`);
  if (res.ok) {
    const data = await res.json();
    console.log(data);
  }
};

fetchWish();