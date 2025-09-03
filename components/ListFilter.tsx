import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { X } from 'lucide-react';
import { ListFilters } from '../types';
// Filter options for list filtering
const locationOptions = [
  'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Pune', 'Hyderabad', 'Ahmedabad', 
  'Surat', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Bhopal', 'Visakhapatnam',
  'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik', 'Faridabad', 'Meerut',
  'Rajkot', 'Kalyan-Dombivali', 'Vasai-Virar', 'Varanasi', 'Srinagar', 'Dhanbad', 'Jodhpur',
  'Amritsar', 'Raipur', 'Allahabad', 'Coimbatore', 'Jabalpur', 'Gwalior', 'Vijayawada',
  'Madurai', 'Gurgaon', 'Noida', 'Kochi', 'Thiruvananthapuram', 'Chandigarh', 'Mysore',
  'Dehradun', 'Ranchi', 'Jalandhar'
];

const jobMandateOptions = [
  'Delivery Executive', 'Customer Support', 'Technical Support', 'Sales Representative',
  'Field Executive', 'Logistics Coordinator', 'Customer Service', 'Operations Executive'
];

const ageRangeOptions = ['18-25', '20-30', '21-35', '22-40', '25-45', '30-50', '35-55'];

const sectorOptions = [
  'Logistics', 'Service', 'Technology', 'Retail', 'Healthcare', 'Food & Beverage', 
  'E-commerce', 'Financial Services', 'Education', 'Manufacturing'
];

interface ListFilterProps {
  filters: ListFilters;
  onFiltersChange: (filters: ListFilters) => void;
}

export function ListFilter({ filters, onFiltersChange }: ListFilterProps) {
  const updateMultiSelect = (key: keyof ListFilters, value: string) => {
    if (key === 'dateRange') return;
    
    const currentValues = filters[key] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    
    onFiltersChange({ ...filters, [key]: newValues });
  };

  const removeBadge = (key: keyof ListFilters, value: string) => {
    if (key === 'dateRange') return;
    
    const currentValues = filters[key] as string[];
    onFiltersChange({ 
      ...filters, 
      [key]: currentValues.filter(v => v !== value) 
    });
  };

  const renderMultiSelect = (
    key: keyof ListFilters,
    label: string,
    options: string[],
    placeholder: string
  ) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select onValueChange={(value) => updateMultiSelect(key, value)}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="flex flex-wrap gap-1 mt-2">
        {(filters[key] as string[]).map((item) => (
          <Badge key={item} variant="secondary" className="flex items-center gap-1">
            {item}
            <X 
              className="h-3 w-3 cursor-pointer" 
              onClick={() => removeBadge(key, item)}
            />
          </Badge>
        ))}
      </div>
    </div>
  );

  return (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>List Filter</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {renderMultiSelect('location', 'Location', locationOptions, 'Select locations')}
        {renderMultiSelect('jobMandate', 'Job Mandate', jobMandateOptions, 'Select job mandates')}
        {renderMultiSelect('ageRange', 'Age Range', ageRangeOptions, 'Select age ranges')}
        {renderMultiSelect('sector', 'Sector', sectorOptions, 'Select sectors')}
        
        {/* Date Range */}
        <div className="space-y-2">
          <Label>Date of List Creation</Label>
          <div className="flex gap-2">
            <Input
              type="date"
              placeholder="From"
              value={filters.dateRange.from}
              onChange={(e) => onFiltersChange({
                ...filters,
                dateRange: { ...filters.dateRange, from: e.target.value }
              })}
            />
            <Input
              type="date"
              placeholder="To"
              value={filters.dateRange.to}
              onChange={(e) => onFiltersChange({
                ...filters,
                dateRange: { ...filters.dateRange, to: e.target.value }
              })}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}