import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Slider } from './ui/slider';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Badge } from './ui/badge';
import { X } from 'lucide-react';
import { CandidateFilters } from '../types';
import { locationOptions } from '../data/mockData';

interface CandidateFilterProps {
  filters: CandidateFilters;
  onFiltersChange: (filters: CandidateFilters) => void;
}

export function CandidateFilter({ filters, onFiltersChange }: CandidateFilterProps) {
  const updateLocation = (location: string) => {
    const newLocations = filters.location.includes(location)
      ? filters.location.filter(l => l !== location)
      : [...filters.location, location];
    
    onFiltersChange({ ...filters, location: newLocations });
  };

  const removeLocation = (location: string) => {
    onFiltersChange({ 
      ...filters, 
      location: filters.location.filter(l => l !== location) 
    });
  };

  return (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Candidate Filter</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Location Filter */}
        <div className="space-y-2">
          <Label>Location</Label>
          <Select onValueChange={updateLocation}>
            <SelectTrigger>
              <SelectValue placeholder="Select locations" />
            </SelectTrigger>
            <SelectContent>
              {locationOptions.map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex flex-wrap gap-1 mt-2">
            {filters.location.map((location) => (
              <Badge key={location} variant="secondary" className="flex items-center gap-1">
                {location}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => removeLocation(location)}
                />
              </Badge>
            ))}
          </div>
        </div>

        {/* Pincode Range */}
        <div className="space-y-2">
          <Label>Pincode Range</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={filters.pincodeRange.min || ''}
              onChange={(e) => onFiltersChange({
                ...filters,
                pincodeRange: { ...filters.pincodeRange, min: parseInt(e.target.value) || 0 }
              })}
            />
            <Input
              type="number"
              placeholder="Max"
              value={filters.pincodeRange.max || ''}
              onChange={(e) => onFiltersChange({
                ...filters,
                pincodeRange: { ...filters.pincodeRange, max: parseInt(e.target.value) || 999999 }
              })}
            />
          </div>
        </div>

        {/* Experience Range */}
        <div className="space-y-2">
          <Label>Experience (Years): {filters.experienceRange.min} - {filters.experienceRange.max}</Label>
          <Slider
            min={0}
            max={20}
            step={1}
            value={[filters.experienceRange.min, filters.experienceRange.max]}
            onValueChange={([min, max]) => onFiltersChange({
              ...filters,
              experienceRange: { min, max }
            })}
            className="w-full"
          />
        </div>

        {/* Two-wheeler Availability */}
        <div className="space-y-2">
          <Label>Two-wheeler Availability</Label>
          <RadioGroup
            value={filters.hasTwoWheeler}
            onValueChange={(value: 'all' | 'yes' | 'no') => onFiltersChange({
              ...filters,
              hasTwoWheeler: value
            })}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="all" />
              <Label htmlFor="all">All</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="yes" />
              <Label htmlFor="yes">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="no" />
              <Label htmlFor="no">No</Label>
            </div>
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  );
}