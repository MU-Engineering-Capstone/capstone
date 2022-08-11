import "./Banner.css"

export default function Banner({ text, imgSrc, cursorStyle }) {
  return (
    <article className="backdrop-container" style={{cursor: cursorStyle ? cursorStyle : "default"}}>
      <img src={imgSrc}/>
      <h1>{text}</h1>
    </article>
  )
}
