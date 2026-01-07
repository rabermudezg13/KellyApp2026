import { useNavigate } from 'react-router-dom'

function RegisterVisitPage() {
  const navigate = useNavigate()

  const visitTypes = [
    {
      id: 'info-session',
      title: 'Info Session',
      icon: '📋',
      description: 'Information session registration',
      route: '/info-session',
    },
    {
      id: 'new-hire-orientation',
      title: 'New Hire Orientation',
      icon: '👔',
      description: 'New employee orientation session',
      route: '/new-hire-orientation',
    },
    {
      id: 'badges',
      title: 'Badges',
      icon: '🪪',
      description: 'Badge processing and creation',
      route: '/badges',
    },
    {
      id: 'fingerprints',
      title: 'Fingerprints',
      icon: '👆',
      description: 'Fingerprint appointment scheduling',
      route: '/fingerprints',
    },
    {
      id: 'team-visit',
      title: 'Team Visit',
      icon: '👥',
      description: 'Team or group visit registration',
      route: '/team-visit',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 to-green-700 py-8">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2 text-gray-800">Register Visit</h1>
          <p className="text-gray-600">Please select the type of visit you would like to register for</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visitTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => navigate(type.route)}
              className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all transform hover:scale-105 text-left"
            >
              <div className="text-5xl mb-4 text-center">{type.icon}</div>
              <h3 className="text-xl font-bold mb-2 text-gray-800">{type.title}</h3>
              <p className="text-gray-600 text-sm">{type.description}</p>
            </button>
          ))}
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/')}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}

export default RegisterVisitPage


