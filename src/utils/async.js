export const appendScript = async function(scriptPath) {
  return new Promise(resolve => {
    const script = document.createElement("script");
    script.src = scriptPath;
    script.async = true;
    script.onload = () => { resolve(); };
    document.body.appendChild(script);
  });
}
