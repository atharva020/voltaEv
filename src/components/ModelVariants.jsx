import '../styles/ModelVariants.css'

const VARIANTS = ['VOLTA S', 'VOLTA S LONG RANGE', 'VOLTA S PLAID']

export default function ModelVariants({ activeIndex = 1 }) {
  return (
    <div className="model-variants" id="model-variants">
      <ul>
        {VARIANTS.map((v, i) => (
          <li
            key={v}
            className={i === activeIndex ? 'model-variants__item--active' : 'model-variants__item--dim'}
          >
            {v}
          </li>
        ))}
      </ul>
    </div>
  )
}
