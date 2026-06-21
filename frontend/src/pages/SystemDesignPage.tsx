export default function SystemDesignPage() {
  const nodes = [
    ['Internet', 'Users accessing the platform'],
    ['CloudFront', 'Cache /static/* content'],
    ['ALB', 'Routes traffic to healthy EC2s'],
    ['EC2 x2', 'FastAPI containers or services'],
    ['MySQL RDS', 'Operational database'],
    ['CloudWatch', 'Metrics and logs'],
    ['ECR', 'Container registry'],
    ['S3', 'Storage and reports'],
    ['IAM/SSM', 'Secure administration'],
  ]

  return (
    <div className="page-stack">
      <section className="panel-card">
        <div className="panel-head">
          <div>
            <h3>System Design</h3>
            <p className="muted">Mapped to the TutorBot AI Education Cloud architecture.</p>
          </div>
          <span className="chip">AWS case study ready</span>
        </div>

        <div className="diagram-wrap">
          {nodes.map(([title, desc], index) => (
            <div key={title} className="diagram-node">
              <strong>{title}</strong>
              <span>{desc}</span>
              {index < nodes.length - 1 ? <div className="arrow">↓</div> : null}
            </div>
          ))}
        </div>
      </section>

      <section className="panel-card">
        <div className="panel-head">
          <h3>How it all fits</h3>
        </div>
        <div className="insight-box">
          <p>
            The frontend presents a real operational portal for teachers and students, while the backend provides mock-role login, CRUD APIs, monitoring endpoints, and cloud health data.
          </p>
          <p>
            This matches the AWS requirements: EC2, RDS MySQL, S3, Docker, ECR, CloudFront, ALB, CloudWatch, IAM, and Linux administration demonstration.
          </p>
        </div>
      </section>
    </div>
  )
}
