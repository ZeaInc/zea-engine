import { LibsRegistry } from './LibsRegistry'

const libsRegistry = new LibsRegistry('2.0.0')

describe('Libraries registry', () => {
  it('Registers a valid library', () => {
    const validPackageJson = {
      dependencies: {
        '@zeainc/zea-engine': '^2.0.0',
      },
      name: 'fake-lib',
      version: '0.0.1',
    }

    libsRegistry.registerLib(validPackageJson)

    expect(libsRegistry.listLibs()).toMatchSnapshot()
  })

  it('Rejects an invalid library', () => {
    const invalidPackageJson = {
      dependencies: {
        '@zeainc/zea-engine': '^3.0.0',
      },
      name: 'fake-lib',
      version: '0.0.1',
    }

    expect(() => {
      libsRegistry.registerLib(invalidPackageJson)
    }).toThrow()
  })
})
