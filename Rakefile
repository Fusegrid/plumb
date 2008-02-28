require 'rake'
require 'rake/packagetask'

PLUMB_ROOT     = File.expand_path(File.dirname(__FILE__))
PLUMB_PKG_DIR  = File.join(PLUMB_ROOT, 'pkg')
PLUMB_VERSION  = "0.1.1"

task :default => [:package, :clean_package_source]

Rake::PackageTask.new('plumb', PLUMB_VERSION) do |package|
  package.need_tar_gz = true
  package.need_zip = true
  package.package_dir = PLUMB_PKG_DIR
  package.package_files.include(
    'index.html',
    '[A-Z]*',
    'lib/**',
    'src/**',
    'stylesheets/**',
    'images/**',
    'test/**'
  )
end

task :clean_package_source do
  rm_rf File.join(PLUMB_PKG_DIR, "plumb-#{PLUMB_VERSION}")
end